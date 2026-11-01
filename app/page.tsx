import NativeTemple from '@/components/native-temple';
import {validLocale} from '@/lib/i18n';
import {validRoom} from '@/lib/rooms';
export default async function Page({searchParams}:{searchParams:Promise<{lang?:string;room?:string}>}){const params=await searchParams,locale=params.lang??null;return <NativeTemple initialLocale={validLocale(locale)?locale:'en'} initialRoom={validRoom(params.room)?params.room:'maru'}/>;}
