import abi from '../abis/src/contracts/DoNation.sol/DoNation.json'
import address from '../abis/contractAddress.json'
import { getGlobalState, setGlobalState } from '../store'
import { ethers } from 'ethers'

const { ethereum } = window
const contractAddress = address.address
const contractAbi = abi.abi
let tx

const connectWallet = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    setGlobalState('connectedAccount', accounts[0]?.toLowerCase())
  } catch (error) {
    reportError(error)
  }
}

const isWallectConnected = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    setGlobalState('connectedAccount', accounts[0]?.toLowerCase())

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', async () => {
      setGlobalState('connectedAccount', accounts[0]?.toLowerCase())
      await isWallectConnected()
    })

    if (accounts.length) {
      setGlobalState('connectedAccount', accounts[0]?.toLowerCase())
    } else {
      alert('Please connect wallet.')
      console.log('No accounts found.')
    }
  } catch (error) {
    reportError(error)
  }
}

const getEtheriumContract = async () => {
  const connectedAccount = getGlobalState('connectedAccount')

  if (connectedAccount) {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, contractAbi, signer)

    return contract
  } else {
    return getGlobalState('contract')
  }
}

const createMission = async ({
  title,
  description,
  imageURL,
  cost,
  expiresAt,
}) => {
  try {
    if (!ethereum) return alert('Please install Metamask')

    const contract = await getEtheriumContract()
    cost = ethers.utils.parseEther(cost)
    tx = await contract.createMission(title, description, imageURL, cost, expiresAt)
    await tx.wait()
    await loadMissions()
  } catch (error) {
    reportError(error)
  }
}

const updateMission = async ({
  id,
  title,
  description,
  imageURL,
  expiresAt,
}) => {
  try {
    if (!ethereum) return alert('Please install Metamask')

    const contract = await getEtheriumContract()
    tx = await contract.updateMission(id, title, description, imageURL, expiresAt)
    await tx.wait()
    await loadMission(id)
  } catch (error) {
    reportError(error)
  }
}

const deleteMission = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const contract = await getEtheriumContract()
    await contract.deleteMission(id)
  } catch (error) {
    reportError(error)
  }
}

const loadMissions = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask')

    const contract = await getEtheriumContract()
    const missions = await contract.getMissions()
    const stats = await contract.stats()

    setGlobalState('stats', structureStats(stats))
    setGlobalState('missions', structuredMissions(missions))
  } catch (error) {
    reportError(error)
  }
}

const loadMission = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const contract = await getEtheriumContract()
    const mission = await contract.getMission(id)

    setGlobalState('mission', structuredMissions([mission])[0])
  } catch (error) {
    alert(JSON.stringify(error.message))
    reportError(error)
  }
}

const supportMission = async (id, amount) => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const connectedAccount = getGlobalState('connectedAccount')
    const contract = await getEtheriumContract()
    amount = ethers.utils.parseEther(amount)

    tx = await contract.supportMission(id, {
      from: connectedAccount,
      value: amount._hex,
    })

    await tx.wait()
    await getSupporters(id)
  } catch (error) {
    reportError(error)
  }
}

const getSupporters = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const contract = await getEtheriumContract()
    let supporters = await contract.getSupporters(id)

    setGlobalState('supporters', structuredSupporters(supporters))
  } catch (error) {
    reportError(error)
  }
}

const payoutMission = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask')
    const connectedAccount = getGlobalState('connectedAccount')
    const contract = await getEtheriumContract()

    tx = await contract.payOutMission(id, {
      from: connectedAccount,
    })

    await tx.wait()
    await getSupporters(id)
  } catch (error) {
    reportError(error)
  }
}

const structuredSupporters = (supporters) =>
  supporters
    .map((supporter) => ({
      owner: supporter.owner.toLowerCase(),
      refunded: supporter.refunded,
      timestamp: new Date(supporter.timestamp.toNumber() * 1000).toJSON(),
      contribution: parseInt(supporter.contribution._hex) / 10 ** 18,
    }))
    .reverse()

const structuredMissions = (missions) =>
  missions
    .map((mission) => ({
      id: mission.id.toNumber(),
      owner: mission.owner.toLowerCase(),
      title: mission.title,
      description: mission.description,
      timestamp: new Date(mission.timestamp.toNumber()).getTime(),
      expiresAt: new Date(mission.expiresAt.toNumber()).getTime(),
      date: toDate(mission.expiresAt.toNumber() * 1000),
      imageURL: mission.imageURL,
      raised: parseInt(mission.raised._hex) / 10 ** 18,
      cost: parseInt(mission.cost._hex) / 10 ** 18,
      supporters: mission.supporters.toNumber(),
      status: mission.status,
    }))
    .reverse()

const toDate = (timestamp) => {
  const date = new Date(timestamp)
  const dd = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`
  const mm =
    date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
  const yyyy = date.getFullYear()
  return `${yyyy}-${mm}-${dd}`
}

const structureStats = (stats) => ({
  totalMissions: stats.totalMissions.toNumber(),
  totalSupporting: stats.totalSupporting.toNumber(),
  totalDonations: parseInt(stats.totalDonations._hex) / 10 ** 18,
})

const reportError = (error) => {
  console.log(error.message)
  throw new Error('No ethereum object.')
}

export {
  connectWallet,
  isWallectConnected,
  createMission,
  updateMission,
  deleteMission,
  loadMissions,
  loadMission,
  supportMission,
  getSupporters,
  payoutMission,
}
