import React from 'react';
import Identicons from 'react-identicons'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { truncate, daysRemaining } from '../store'
import { FaEthereum } from 'react-icons/fa'

const Missions = ({ missions }) => {
  const [end, setEnd] = useState(4)
  const [count] = useState(4)
  const [collection, setCollection] = useState([])

  const getCollection = () => missions.slice(0, end)

  useEffect(() => {
    setCollection(getCollection())
  }, [missions, end])

  return (
    <div className="flex flex-col px-6 mb-7">
      <div className="flex justify-center items-center flex-wrap">
        {collection.map((mission, i) => (
          <MissionCard key={i} mission={mission} />
        ))}
      </div>

      {missions.length > collection.length ? (
        <div className="flex justify-center items-center my-5">
          <button
            type="button"
            className="inline-block px-6 py-2.5 bg-purple-600
          text-white font-medium text-xs leading-tight uppercase
          rounded-full shadow-md hover:bg-purple-700"
            onClick={() => setEnd(end + count)}
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  )
}

const MissionCard = ({ mission }) => {
  const expired = new Date().getTime() > Number(mission?.expiresAt + '000')

  return (
    <div id="missions" className="rounded-lg shadow-lg bg-white w-64 m-4">
      <Link to={'/missions/' + mission.id}>
        <img
          src={mission.imageURL}
          alt={mission.title}
          className="rounded-xl h-64 w-full object-cover"
        />

        <div className="p-4">
          <h5>{truncate(mission.title, 25, 0, 28)}</h5>

          <div className="flex flex-col">
            <div className="flex justify-start space-x-2 items-center mb-3">
              <Identicons
                className="rounded-full shadow-md"
                string={mission.owner}
                size={15}
              />
              <small className="text-gray-700">
                {truncate(mission.owner, 4, 4, 11)}
              </small>
            </div>

            <small className="text-gray-500">
              {expired ? 'Expired' : daysRemaining(mission.expiresAt) + ' left'}
            </small>
          </div>

          <div className="w-full bg-gray-300 overflow-hidden">
            <div
              className="bg-purple-600 text-xs font-medium
            text-green-100 text-center p-0.5 leading-none
            rounded-l-full"
              style={{ width: `${(mission.raised / mission.cost) * 100}%` }}
            ></div>
          </div>

          <div
            className="flex justify-between items-center 
        font-bold mt-1 mb-2 text-gray-700"
          >
            <small>{mission.raised} ETH Raised</small>
            <small className="flex justify-start items-center">
              <FaEthereum />
              <span>{mission.cost} ETH</span>
            </small>
          </div>

          <div
            className="flex justify-between items-center flex-wrap
            mt-4 mb-2 text-gray-500 font-bold"
          >
            <small>
              {mission.supporters} Contributor{mission.supporters <= 1 ? '' : 's'}
            </small>
            <div>
              {expired ? (
                <small className="text-red-500">Expired</small>
              ) : mission?.status == 0 ? (
                <small className="text-gray-500">Open</small>
              ) : mission?.status == 1 ? (
                <small className="text-green-500">Accepted</small>
              ) : mission?.status == 2 ? (
                <small className="text-gray-500">Reverted</small>
              ) : mission?.status == 3 ? (
                <small className="text-red-500">Deleted</small>
              ) : (
                <small className="text-orange-500">Paid</small>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Missions
