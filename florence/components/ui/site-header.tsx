import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from '@/app/common/ModeToggle';

export function SiteHeader() {
    return (
        <header className='group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear'>
            <div className='flex w-full items-center gap-10 px-4 lg:gap-2 lg:px-6 space-between flex'>
                <SidebarTrigger className='-ml-1' />
                <Separator
                    orientation='vertical'
                    className='mx-2 data-[orientation=vertical]:h-4'
                />
                <h1 className='text-base font-medium w-full'>
                    Florence-2-Base Captioning Service
                </h1>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%',
                    }}
                >
                    <div style={{ justifyContent: 'flex-end' }}>
                        <ModeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}

<div style={{ justifyContent: 'flex-end' }}>
    <ModeToggle />
</div>;
