import { Profile, Item, Claim, Message } from '../types';

import heroBannerImg from '../assets/images/hero_banner_campus_1790154691436.jpg';
import lostCameraImg from '../assets/images/lost_camera_dslr_1790154705768.jpg';
import lostBackpackImg from '../assets/images/lost_navy_backpack_1790154716582.jpg';
import lostWalletImg from '../assets/images/lost_leather_wallet_1790154727440.jpg';
import lostEarbudsImg from '../assets/images/lost_wireless_earbuds_1790154738514.jpg';

export const ASSET_IMAGES = {
  heroBanner: heroBannerImg,
  camera: lostCameraImg,
  backpack: lostBackpackImg,
  wallet: lostWalletImg,
  earbuds: lostEarbudsImg,
};

export const MOCK_USERS: Profile[] = [
  {
    id: 'user-siswa-1',
    full_name: 'Damar Areefa Naraya',
    role: 'siswa',
    email: 'damarareefanaraya@gmail.com',
    phone: '0812-3456-7890',
    institution: 'SMKN 24 Jakarta',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    created_at: '2026-01-10T08:00:00Z',
  },
];

export const INITIAL_ITEMS: Item[] = [];

export const INITIAL_CLAIMS: Claim[] = [];

export const INITIAL_MESSAGES: Message[] = [];
