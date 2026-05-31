import {useUser} from '../hooks/useUser';
import {useSupaBase} from '../hooks/useSupaBase';
import axios from 'axios';
import './App.css'
function App() {
  
  const supabase = useSupaBase();
  const {claims} = useUser(supabase);
  if(!claims){
    return <div>
      <button onClick={async()=>{
        try{
          const win: any = window;
          const sol = win?.solana;
          const isSolCompatible = sol && typeof sol.signMessage === 'function' && sol.publicKey && typeof sol.publicKey.toBase58 === 'function';
          if(!isSolCompatible){
            alert('No compatible Solana wallet detected. Install and unlock Phantom (or another wallet) in your browser.');
            console.error('Solana wallet missing signMessage or publicKey.toBase58', sol);
            return;
          }
          await supabase.auth.signInWithWeb3({
            chain:"solana",
            statement:"I confirm that I am the owner of this address"
          })
        }catch(e){
          console.error('signInWithWeb3 error', e);
          alert('Wallet sign-in failed: ' + (e as any)?.message || e);
        }
      }}>
        Login
      </button>
    </div>
    
  }
  if(claims){
    return <div>
      <button onClick= {async()=>{
        await supabase.auth.signOut();
      }}>Sign out</button>

      <button type="button" onClick={async ()=>{
    try{
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      console.log("this is from ENzo", token);
      const headers: any = {};
      if(token){ headers.Authorization = `Bearer ${token}` }
      const resp = await axios.post("http://localhost:3000/buy", {}, { headers });
      console.log('Buy response', resp.data);
    }catch(err:any){
      console.error('Buy request error', err?.response?.status, err?.response?.data || err.message || err);
    }
  }}>this is the BUy button</button>
    </div>
  }

  
  
}

export default App
