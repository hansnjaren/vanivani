import { Noto_Sans } from 'next/font/google';

export const noto_Sans = Noto_Sans({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    style: ['normal', 'italic'],
    subsets: ['cyrillic', 'cyrillic-ext', 'devanagari', 'greek', 'greek-ext', 'latin', 'latin-ext', 'vietnamese'],
})