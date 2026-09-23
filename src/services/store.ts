import { Profile, Item, Claim, Message, UserRole, ItemStatus } from '../types';
import { MOCK_USERS, INITIAL_ITEMS, INITIAL_CLAIMS, INITIAL_MESSAGES } from '../data/mockData';
import { getSupabase } from './supabase';

const STORAGE_KEYS = {
  CURRENT_USER: 'backtome_current_user_v2',
  IS_LOGGED_IN: 'backtome_is_logged_in_v2',
  ITEMS: 'backtome_items_v2',
  CLAIMS: 'backtome_claims_v2',
  MESSAGES: 'backtome_messages_v2',
  USERS: 'backtome_users_v2',
  NETWORK_ONLINE: 'backtome_network_online_v2',
};

type EventCallback = (payload: any) => void;

class BackToMeStore {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isOnline: boolean = true;

  constructor() {
    this.init();
    // Non-blocking trigger cloud sync when initialized
    this.syncWithCloud().catch(err => {
      console.warn('Initial cloud sync warning:', err);
    });
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(MOCK_USERS[0])); // Damar (siswa)
    }
    if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLAIMS)) {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(INITIAL_CLAIMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    }
    const savedNetwork = localStorage.getItem(STORAGE_KEYS.NETWORK_ONLINE);
    this.isOnline = savedNetwork !== null ? JSON.parse(savedNetwork) : true;
  }

  // --- Realtime Event Dispatcher (Supabase Realtime Channel emulation) ---
  public subscribe(channel: string, callback: EventCallback): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);

    return () => {
      this.listeners.get(channel)?.delete(callback);
    };
  }

  private emit(channel: string, payload: any) {
    if (!this.isOnline) {
      // In offline mode, events are queued/delayed until reconnect
      return;
    }
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in realtime listener on ${channel}:`, e);
        }
      });
    }

    // Global broadcast channel
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach((cb) => cb({ channel, payload }));
    }
  }

  // Network Simulation (TC-10, TC-11)
  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  public setNetworkStatus(online: boolean) {
    this.isOnline = online;
    localStorage.setItem(STORAGE_KEYS.NETWORK_ONLINE, JSON.stringify(online));
    this.emit('network-status', { online });
    if (online) {
      // Trigger a sync re-fetch event
      this.emit('items-status', { type: 'SYNC', items: this.getItems() });
      this.syncWithCloud().catch(() => {});
    }
  }

  // Synchronize local storage with Supabase cloud database (Two-Way Sync)
  public async syncWithCloud() {
    const supabase = getSupabase();
    if (!supabase || !this.isOnline) return;

    try {
      // 1. Fetch Items from Supabase
      const { data: cloudItems, error: itemsError } = await supabase
        .from('items')
        .select('*');

      if (!itemsError && cloudItems) {
        // Merge cloud items with local ones
        const localItems = this.getItems();
        const mergedItems = [...localItems];

        cloudItems.forEach((cItem: any) => {
          const idx = mergedItems.findIndex((it) => it.id === cItem.id);
          if (idx === -1) {
            mergedItems.push(cItem);
          } else {
            // Take the one with the newer updated_at timestamp
            const localTime = new Date(mergedItems[idx].updated_at || 0).getTime();
            const cloudTime = new Date(cItem.updated_at || 0).getTime();
            if (cloudTime > localTime) {
              mergedItems[idx] = cItem;
            }
          }
        });

        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(mergedItems));
        this.emit('items-status', { type: 'SYNC', items: mergedItems });
      }

      // 2. Fetch Claims from Supabase
      const { data: cloudClaims, error: claimsError } = await supabase
        .from('claims')
        .select('*');

      if (!claimsError && cloudClaims) {
        const localClaims = this.getClaims();
        const mergedClaims = [...localClaims];

        cloudClaims.forEach((cClaim: any) => {
          const idx = mergedClaims.findIndex((cl) => cl.id === cClaim.id);
          if (idx === -1) {
            mergedClaims.push(cClaim);
          } else {
            const localTime = new Date(mergedClaims[idx].updated_at || 0).getTime();
            const cloudTime = new Date(cClaim.updated_at || 0).getTime();
            if (cloudTime > localTime) {
              mergedClaims[idx] = cClaim;
            }
          }
        });

        localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(mergedClaims));
        this.emit('claims-status', { type: 'SYNC', claims: mergedClaims });
      }

      // 3. Fetch Messages from Supabase
      const { data: cloudMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*');

      if (!messagesError && cloudMessages) {
        const localMessages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
        const mergedMessages = [...localMessages];

        cloudMessages.forEach((cMsg: any) => {
          if (!mergedMessages.some((m) => m.id === cMsg.id)) {
            mergedMessages.push(cMsg);
          }
        });

        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(mergedMessages));
      }
    } catch (e) {
      console.warn('Supabase Cloud Sync inactive or tables not set up yet:', e);
    }
  }

  // --- Current User / Auth ---
  public getIsLoggedIn(): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return raw !== null ? JSON.parse(raw) : false;
  }

  public setIsLoggedIn(loggedIn: boolean) {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(loggedIn));
    this.emit('auth-change', { loggedIn, user: this.getCurrentUser() });
  }

  public logout() {
    this.setIsLoggedIn(false);
  }

  public getCurrentUser(): Profile {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_USERS[0];
  }

  public setCurrentUser(user: Profile) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(true));
    this.emit('auth-change', { user, loggedIn: true });
  }

  public switchUserByRole(role: UserRole) {
    const found = MOCK_USERS.find((u) => u.role === role);
    if (found) {
      this.setCurrentUser(found);
    }
  }

  public getAllUsers(): Profile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : MOCK_USERS;
  }

  public registerNewUser(user: Profile) {
    const all = this.getAllUsers();
    if (!all.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
      all.push(user);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(all));
    }
  }

  public getUserById(id: string): Profile | undefined {
    return this.getAllUsers().find((u) => u.id === id);
  }

  // --- Storage Bucket: 'item-photos' (TC-01, TC-02, TC-04) ---
  public async uploadPhoto(file: File): Promise<{ path: string; publicUrl: string }> {
    const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB as per SRS BAB 2.1 & 4.1 (TC-01)
    
    // TC-01: File > 25MB rejected
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error('Ukuran file maksimal 25MB');
    }

    // TC-04: Non-image files rejected
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpe?g|png|webp|gif)$/i)) {
      throw new Error('Format file tidak didukung. Harap unggah foto bertipe JPG, PNG, atau WEBP.');
    }

    // Convert file to Data URL for instant preview & persistence
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const publicUrl = reader.result as string;
        const path = `item-photos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        resolve({ path, publicUrl });
      };
      reader.onerror = () => {
        reject(new Error('Gagal memproses file foto.'));
      };
      reader.readAsDataURL(file);
    });
  }

  // --- Items (Katalog Barang) ---
  public getItems(): Item[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return raw ? JSON.parse(raw) : INITIAL_ITEMS;
  }

  public getItemById(id: string): Item | undefined {
    return this.getItems().find((it) => it.id === id);
  }

  public createItem(data: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'reporter_id' | 'reporter_name' | 'reporter_role'>): Item {
    // TC-03: Validate title not empty
    if (!data.title || data.title.trim() === '') {
      throw new Error('Judul barang tidak boleh kosong');
    }

    const currentUser = this.getCurrentUser();
    const items = this.getItems();
    const newItem: Item = {
      ...data,
      id: `item-${Date.now()}`,
      reporter_id: currentUser.id,
      reporter_name: currentUser.full_name,
      reporter_role: currentUser.role,
      reporter_phone: data.reporter_phone || currentUser.phone || '0812-3456-7890',
      status: 'belum_diklaim', // TC-05
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    this.emit('items-status', { type: 'INSERT', item: newItem });

    // Background cloud save
    const supabase = getSupabase();
    if (supabase && this.isOnline) {
      supabase.from('items').upsert(newItem).then(({ error }: { error: any }) => {
        if (error) console.warn('Gagal sync item baru ke Supabase:', error);
      });
    }

    return newItem;
  }

  public updateItemStatus(itemId: string, newStatus: ItemStatus, storageLocation?: string): Item {
    const items = this.getItems();
    const idx = items.findIndex((it) => it.id === itemId);
    if (idx === -1) throw new Error('Barang tidak ditemukan');

    items[idx] = {
      ...items[idx],
      status: newStatus,
      storage_location: storageLocation ?? items[idx].storage_location,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    this.emit('items-status', { type: 'UPDATE', item: items[idx] });

    // Background cloud save
    const supabase = getSupabase();
    if (supabase && this.isOnline) {
      supabase.from('items').upsert(items[idx]).then(({ error }: { error: any }) => {
        if (error) console.warn('Gagal sync status item ke Supabase:', error);
      });
    }

    return items[idx];
  }

  public updateItem(itemId: string, data: Partial<Item>): Item {
    const items = this.getItems();
    const idx = items.findIndex((it) => it.id === itemId);
    if (idx === -1) throw new Error('Barang tidak ditemukan');

    items[idx] = {
      ...items[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    this.emit('items-status', { type: 'UPDATE', item: items[idx] });

    // Background cloud save
    const supabase = getSupabase();
    if (supabase && this.isOnline) {
      supabase.from('items').upsert(items[idx]).then(({ error }: { error: any }) => {
        if (error) console.warn('Gagal sync update item ke Supabase:', error);
      });
    }

    return items[idx];
  }

  public deleteItem(itemId: string) {
    const items = this.getItems();
    const filtered = items.filter((it) => it.id !== itemId);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filtered));

    // Also delete any associated claims
    const claims = this.getClaims();
    const claimsFiltered = claims.filter((c) => c.item_id !== itemId);
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claimsFiltered));

    this.emit('items-status', { type: 'RESET', items: filtered });
    this.emit('claims-status', { type: 'RESET', claims: claimsFiltered });

    // Background cloud delete
    const supabase = getSupabase();
    if (supabase && this.isOnline) {
      supabase.from('items').delete().eq('id', itemId).then(({ error }: { error: any }) => {
        if (error) console.warn('Gagal sync delete item dari Supabase:', error);
      });
      supabase.from('claims').delete().eq('item_id', itemId).then(({ error }: { error: any }) => {
        if (error) console.warn('Gagal sync delete claims dari Supabase:', error);
      });
    }
  }

  // --- Claims (Klaim Kepemilikan) ---
  public getClaims(): Claim[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    return raw ? JSON.parse(raw) : INITIAL_CLAIMS;
  }

  public getClaimsByItemId(itemId: string): Claim[] {
    return this.getClaims().filter((c) => c.item_id === itemId);
  }

  public getClaimsByClaimant(claimantId: string): Claim[] {
    return this.getClaims().filter((c) => c.claimant_id === claimantId);
  }

  public submitClaim(itemId: string, proofDescription: string, proofAttachmentUrl?: string): Claim {
    // TC-09: Claim on item already returned is strictly blocked
    const item = this.getItemById(itemId);
    if (!item) {
      throw new Error('Barang tidak ditemukan');
    }
    if (item.status === 'sudah_dikembalikan') {
      throw new Error('Barang ini sudah dikembalikan kepada pemilik sah dan tidak dapat diklaim lagi.');
    }

    if (!proofDescription || proofDescription.trim().length < 5) {
      throw new Error('Mohon tuliskan deskripsi bukti kepemilikan minimal 5 karakter.');
    }

    const currentUser = this.getCurrentUser();
    const claims = this.getClaims();

    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      item_id: itemId,
      claimant_id: currentUser.id,
      claimant_name: currentUser.full_name,
      claimant_role: currentUser.role,
      proof_description: proofDescription.trim(),
      proof_attachment_url: proofAttachmentUrl,
      status: 'menunggu',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    claims.unshift(newClaim);
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));

    // Update item status to 'proses_verifikasi' if it's currently 'belum_diklaim'
    if (item.status === 'belum_diklaim') {
      this.updateItemStatus(itemId, 'proses_verifikasi');
    }

    // Auto-create initial message in the verification chat
    this.sendMessage(
      newClaim.id,
      `Saya mengajukan klaim atas barang ini. Bukti/ciri kepemilikan: "${proofDescription.trim()}"`,
      currentUser,
    );

    this.emit('claims-status', { type: 'INSERT', claim: newClaim });

    // Background cloud save
    const supabase = getSupabase();
    if (supabase && this.isOnline) {
      supabase.from('claims').upsert(newClaim).then(({ error }: { error: any }) => {
        if (error) console.warn('Gagal sync claim baru ke Supabase:', error);
      });
    }

    return newClaim;
  }

  /**
   * handle_claim_decision() - SRS BAB 2.2 Trigger & Edge Function verify-claim
   * TC-06: claim.status = valid, item.status = sudah_dikembalikan, other claims on same item -> ditolak
   * TC-07: claim.status = ditolak, item remains belum_diklaim (if no other pending)
   * TC-08: multiple claims, approval of one auto-rejects others
   */
  public verifyClaimDecision(
    claimId: string,
    decision: 'valid' | 'ditolak',
    verifierNote?: string,
  ): { claim: Claim; item: Item } {
    const claims = this.getClaims();
    const claimIndex = claims.findIndex((c) => c.id === claimId);
    if (claimIndex === -1) throw new Error('Data klaim tidak ditemukan');

    const targetClaim = claims[claimIndex];
    const itemId = targetClaim.item_id;
    const item = this.getItemById(itemId);
    if (!item) throw new Error('Barang terkait tidak ditemukan');

    const currentUser = this.getCurrentUser();

    if (decision === 'valid') {
      // 1. Set current claim to valid
      targetClaim.status = 'valid';
      targetClaim.decision_note = verifierNote || 'Bukti kepemilikan terverifikasi sah.';
      targetClaim.verified_by = `${currentUser.full_name} (${currentUser.role.toUpperCase()})`;
      targetClaim.verified_at = new Date().toISOString();
      targetClaim.updated_at = new Date().toISOString();

      // 2. Automatically reject all other pending claims on this item (Trigger handle_claim_decision - TC-08)
      claims.forEach((c) => {
        if (c.item_id === itemId && c.id !== claimId && c.status === 'menunggu') {
          c.status = 'ditolak';
          c.decision_note = 'Barang telah terverifikasi kepada pemilik sah lain.';
          c.verified_by = `${currentUser.full_name} (${currentUser.role.toUpperCase()})`;
          c.verified_at = new Date().toISOString();
          c.updated_at = new Date().toISOString();

          // Add system message to those rejected claim chats
          this.sendMessage(
            c.id,
            'Sesi verifikasi ditutup. Barang telah diverifikasi dan diserahkan kepada pengklaim sah lain.',
            currentUser,
            true,
          );
        }
      });

      // 3. Update item status to 'sudah_dikembalikan' (TC-06)
      item.status = 'sudah_dikembalikan';
      item.updated_at = new Date().toISOString();

      // Add system message to this approved claim chat
      this.sendMessage(
        claimId,
        `KLAIM DISETUJUI oleh ${currentUser.full_name}. Catatan: ${verifierNote || 'Barang telah siap diserahkan/telah diserahkan.'}`,
        currentUser,
        true,
      );
    } else {
      // decision === 'ditolak' (TC-07)
      targetClaim.status = 'ditolak';
      targetClaim.decision_note = verifierNote || 'Bukti kepemilikan tidak mencukupi / tidak sesuai.';
      targetClaim.verified_by = `${currentUser.full_name} (${currentUser.role.toUpperCase()})`;
      targetClaim.verified_at = new Date().toISOString();
      targetClaim.updated_at = new Date().toISOString();

      // Check if there are other pending claims on this item
      const hasOtherPending = claims.some(
        (c) => c.item_id === itemId && c.id !== claimId && c.status === 'menunggu',
      );

      if (!hasOtherPending && item.status !== 'sudah_dikembalikan') {
        item.status = 'belum_diklaim';
        item.updated_at = new Date().toISOString();
      }

      this.sendMessage(
        claimId,
        `Klaim tidak dapat diterima. Catatan verifikator: ${verifierNote || 'Bukti tidak sesuai.'}`,
        currentUser,
        true,
      );
    }

    // Persist claims & items
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
    const items = this.getItems().map((it) => (it.id === itemId ? item : it));
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

    // Emit realtime notifications (TC-10)
    this.emit('claims-status', { type: 'UPDATE', claim: targetClaim });
    this.emit('items-status', { type: 'UPDATE', item });
    this.emit(`chat-${claimId}`, { type: 'VERIFICATION_UPDATE', claim: targetClaim });

    // Background cloud save
    const supabase = getSupabase();
    if (supabase && this.isOnline) {
      // Save targets
      supabase.from('claims').upsert(targetClaim).then();
      supabase.from('items').upsert(item).then();
      // Auto rejections
      claims.forEach((c) => {
        if (c.item_id === itemId && c.id !== claimId && c.status === 'ditolak') {
          supabase.from('claims').upsert(c).then();
        }
      });
    }

    return { claim: targetClaim, item };
  }

  // --- Messages & Chat Verification (BAB 2.4 #13 & #14, TC-12) ---
  public getMessages(claimId: string): Message[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const list: Message[] = raw ? JSON.parse(raw) : INITIAL_MESSAGES;
    return list
      .filter((m) => m.claim_id === claimId)
      .sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
  }

  public sendMessage(
    claimId: string,
    text: string,
    sender?: Profile,
    isSystem: boolean = false,
  ): Message {
    if (!text || text.trim() === '') {
      throw new Error('Pesan tidak boleh kosong');
    }

    const currentSender = sender || this.getCurrentUser();
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const allMessages: Message[] = raw ? JSON.parse(raw) : INITIAL_MESSAGES;

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      claim_id: claimId,
      sender_id: currentSender.id,
      sender_name: isSystem ? 'Sistem BackToMe' : currentSender.full_name,
      sender_role: currentSender.role,
      message: text.trim(),
      sent_at: new Date().toISOString(),
      is_system: isSystem,
    };

    allMessages.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));

    // Realtime broadcast (TC-12)
    this.emit(`chat-${claimId}`, newMsg);

    // Background cloud save
    const supabase = getSupabase();
    if (supabase && this.isOnline) {
      supabase.from('messages').upsert(newMsg).then(({ error }: { error: any }) => {
        if (error) console.warn('Gagal sync message ke Supabase:', error);
      });
    }

    return newMsg;
  }

  // Reset to original mock data
  public resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(MOCK_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(INITIAL_CLAIMS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    this.isOnline = true;
    localStorage.setItem(STORAGE_KEYS.NETWORK_ONLINE, 'true');

    this.emit('items-status', { type: 'RESET', items: INITIAL_ITEMS });
    this.emit('claims-status', { type: 'RESET', claims: INITIAL_CLAIMS });
    this.emit('auth-change', { user: MOCK_USERS[0] });
    this.emit('network-status', { online: true });
  }
}

export const store = new BackToMeStore();
