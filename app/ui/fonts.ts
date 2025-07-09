import { Noto_Sans, UnifrakturMaguntia, Gowun_Batang } from 'next/font/google';

export const noto_Sans = Noto_Sans({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    style: ['normal', 'italic'],
    subsets: ['cyrillic', 'cyrillic-ext', 'devanagari', 'greek', 'greek-ext', 'latin', 'latin-ext', 'vietnamese'],
})

export const blackletter = UnifrakturMaguntia({
    weight: ['400'],
    style: ['normal'],
    subsets: ['latin'],
})

export const batang = Gowun_Batang({
    weight: ['400', '700'],
    style: ['normal'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
})