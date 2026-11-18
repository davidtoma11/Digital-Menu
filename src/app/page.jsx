import { getMenu } from '@/lib/menuData';
import Menu from './Menu';

// Meniul vine gata randat de pe server (fără ecran de încărcare).
// Se reîmprospătează la cel mult un minut, iar instant după orice salvare din admin.
export const revalidate = 60;

export default async function Page() {
  const data = await getMenu();
  return <Menu initial={data} />;
}
