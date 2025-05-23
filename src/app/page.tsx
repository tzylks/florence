'use client';

import { FormEvent, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/ui/site-header';
import { Badge, FileUp, FileImage } from 'lucide-react';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Home() {
    const [image, setImage] = useState<File | null>(null);
    const [result, setResult] = useState<string | { error: string } | null>(
        null
    );
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setResult(null); // Reset result when new image is selected
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!image) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post('/api/predict', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            setResult(response.data.result['<DETAILED_CAPTION>']);
        } catch (error) {
            console.error('Error:', error);
            setResult({ error: 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='App'>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />
                    <div className='*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-10 m-10'>
                        <div className='grid grid-cols-1 grid-rows-1 gap-4'>
                            <div>
                                <Card className='@container/card'>
                                    <CardHeader className='relative'>
                                        <CardDescription>
                                            Upload Image
                                        </CardDescription>
                                        <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
                                            File Upload
                                        </CardTitle>
                                        <div className='absolute right-4 top-4'>
                                            <Badge className='flex gap-1 round-lg text-xs'>
                                                <FileUp className='size-1' />
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardFooter className='flex-col items-start gap-1 text-sm min-h-10 max-h-50'>
                                        <div className='flex px-4 lg:px-4'>
                                            <Input
                                                type='file'
                                                accept='image/*'
                                                onChange={handleImageChange}
                                                className='w-full mr-2'
                                            />
                                        </div>
                                    </CardFooter>
                                </Card>
                            </div>
                            {image && (
                                <Card className='@container/card'>
                                    <CardHeader className='relative'>
                                        <CardDescription>
                                            Results
                                        </CardDescription>
                                        <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums flex gap-1'>
                                            <div>AI Image Captioning</div>
                                            <form onSubmit={handleSubmit}>
                                                <div className='flex px-4 lg:px-4'>
                                                    <Button
                                                        type='submit'
                                                        disabled={loading}
                                                    >
                                                        {loading
                                                            ? 'Processing...'
                                                            : 'Get Result'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardTitle>
                                        <div className='absolute right-4 top-4'>
                                            <Badge className='flex gap-1 rounded-lg text-xs'>
                                                <FileImage className='size-3' />
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardFooter className='flex-col items-start gap-1 text-sm min-h-5 max-h-110 '>
                                        {image && (
                                            <div>
                                                <h2>Preview:</h2>
                                                <img
                                                    src={URL.createObjectURL(
                                                        image
                                                    )}
                                                    alt='Uploaded'
                                                    style={{
                                                        maxWidth: '300px',
                                                        maxHeight: '250px',
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className='w-10'>
                                            {result && (
                                                <div className='mt-6 w-full max-w-md'>
                                                    <h2 className='text-xl font-semibold mb-2'>
                                                        Result:
                                                    </h2>
                                                    <div className='w-250 h-[100px] bg-slate-100 p-4 rounded-md text-slate-700 shadow-inner overflow-auto break-words'>
                                                        {JSON.stringify(
                                                            result,
                                                            null,
                                                            2
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardFooter>
                                </Card>
                            )}
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
