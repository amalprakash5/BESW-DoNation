import { useState, useEffect } from 'react'
import AddButton from '../components/AddButton'
import CreateMission from '../components/CreateMission'
import Hero from '../components/Hero'
import Missions from '../components/Missions'
import { loadMissions } from '../services/blockchain'
import { useGlobalState } from '../store'

const Home = () => {
  const [missions] = useGlobalState('missions')
  const [isAdmin, setAdmin] = useState(false);
  const [account, setAccount] = useState('');
  const admin = process.env.REACT_APP_BESW

  useEffect(async () => {

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0 && accounts[0] !== account) {
        window.location.reload()
      }
    };

    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          if (accounts.length === 0) {
            setAdmin(false)
          }
          else {
            setAccount(accounts[0]);
            setAdmin(accounts[0] === admin);
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        alert('Please install Metamask')
      }
    };

    checkConnection();
    await loadMissions()
  }, [])
  return (
    <>
      <Hero />
      <Missions missions={missions} />
      <CreateMission />
      {isAdmin && <AddButton />}
    </>
  )
}

export default Home
