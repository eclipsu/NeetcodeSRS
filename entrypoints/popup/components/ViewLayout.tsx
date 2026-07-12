import { Header } from './Header';

interface ViewLayoutProps {
  title?: string;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
}

export function ViewLayout({ title = 'NeetcodeSRS', headerContent, children }: ViewLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10">
        <Header title={title}>{headerContent}</Header>
      </div>

      <div
        className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarGutter: 'stable' }}
      >
        {children}
      </div>
    </div>
  );
}
