import { auth } from "@/lib/auth";
import { Providers } from "./providers";
import { LayoutContent } from "./layout-content";
import { SearchModal } from "./search-modal";
import { Agentation } from "agentation";

export async function RootContent({ children }: { children: React.ReactNode }) {
  // Fetch session on the server
  const session = await auth();

  return (
    <Providers session={session}>
      <LayoutContent serverSession={session}>
        {children}
      </LayoutContent>
      <SearchModal />
      <Agentation />
    </Providers>
  );
}
