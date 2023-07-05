import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SupportMission from '../components/SupportMission'
import DeleteMission from '../components/DeleteMission'
import MissionSupporters from '../components/MissionSupporters'
import MissionDetails from '../components/MissionDetails'
import UpdateMission from '../components/UpdateMission'
import { getSupporters, loadMission } from '../services/blockchain'
import { useGlobalState } from '../store'

const Mission = () => {
  const { id } = useParams()
  const [loaded, setLoaded] = useState(false)
  const [mission] = useGlobalState('mission')
  const [supporters] = useGlobalState('supporters')

  useEffect(async () => {
    await loadMission(id)
    await getSupporters(id)
    setLoaded(true)
  }, [])
  return loaded ? (
    <>
      <MissionDetails mission={mission} />
      <UpdateMission mission={mission} />
      <DeleteMission mission={mission} />
      <SupportMission mission={mission} />
      <MissionSupporters supporters={supporters} />
    </>
  ) : null
}

export default Mission
