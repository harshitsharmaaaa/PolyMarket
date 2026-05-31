import { createClient } from '@supabase/supabase-js';
import {useEffect,useState} from 'react'

export function useSupaBase(){
    const [supabase, setSupabase] = useState( createClient("https://ccdqhlougtphaltvngvj.supabase.co","sb_publishable_fUtB6EszD_AEpQDXU7t_LA_72lfYB9O"));
    return supabase;
}