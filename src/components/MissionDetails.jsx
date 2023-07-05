import Identicons from 'react-identicons'
import { FaEthereum } from 'react-icons/fa'
import {
  daysRemaining,
  setGlobalState,
  truncate,
  useGlobalState,
} from '../store'
import { payoutMission } from '../services/blockchain'

const MissionDetails = ({ mission }) => {
  const [connectedAccount] = useGlobalState('connectedAccount')
  const expired = new Date().getTime() > Number(mission?.expiresAt + '000')

  return (
    <div className="pt-24 mb-5 px-6 flex justify-center">
      <div className="flex justify-center flex-col md:w-2/3">
        <div
          className="flex justify-start items-start
        sm:space-x-4 flex-wrap"
        >
          <img
            src={mission?.imageURL}
            alt={mission?.title}
            className="rounded-xl h-64 object-cover sm:w-1/3 w-full"
          />

          <div className="flex-1 sm:py-0 py-4">
            <div className="flex flex-col justify-start flex-wrap">
              <h5 className="text-gray-900 text-xl font-medium mb-2">
                {mission?.title}
              </h5>
              <small className="text-gray-500">
                {expired
                  ? 'Expired'
                  : daysRemaining(mission.expiresAt) + ' left'}
              </small>
            </div>

            <div className="flex justify-between items-center w-full pt-1">
              <div className="flex justify-start space-x-2">
                <Identicons
                  className="rounded-full shadow-md"
                  string={mission?.owner}
                  size={15}
                />
                {mission?.owner ? (
                  <small className="text-gray-700">
                    {truncate(mission?.owner, 4, 4, 11)}
                  </small>
                ) : null}
                <small className="text-gray-500 font-bold">
                  {mission?.supporters} Contributor{mission?.supporters == 1 ? '' : 's'}
                </small>
              </div>

              <div className="font-bold">
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

            <div>
              <p className="text-sm font-light mt-2">{mission?.description}</p>
              <div className="w-full overflow-hidden bg-gray-300 mt-4">
                <div
                  className="bg-purple-600 text-xs font-medium
              text-purple-100 text-center p-0.5 leading-none
              rounded-l-full h-1 overflow-hidden max-w-full"
                  style={{
                    width: `${(mission?.raised / mission?.cost) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center font-bold mt-2">
                <small>{mission?.raised} ETH Raised</small>
                <small className="flex justify-start items-center">
                  <FaEthereum />
                  <span>{mission?.cost} ETH</span>
                </small>
              </div>

              <div className="flex justify-start items-center space-x-2 mt-4">
                {mission?.status == 0 ? (
                  <button
                    type="button"
                    className="inline-block px-6 py-2.5 bg-purple-600
              text-white font-medium text-xs leading-tight uppercase
              rounded-full shadow-md hover:bg-purple-700"
                    onClick={() => setGlobalState('supportModal', 'scale-100')}
                  >
                    Support Misson
                  </button>
                ) : null}
                {connectedAccount == mission?.owner ? (
                  mission?.status != 3 ? (
                    mission?.status == 1 ? (
                      <button
                        type="button"
                        className="inline-block px-6 py-2.5 bg-orange-600
                        text-white font-medium text-xs leading-tight uppercase
                        rounded-full shadow-md hover:bg-orange-700"
                        onClick={() => payoutMission(mission?.id)}
                      >
                        Payout
                      </button>
                    ) : mission?.status != 4 ? (
                      <>
                        <button
                          type="button"
                          className="inline-block px-6 py-2.5 bg-gray-600
                          text-white font-medium text-xs leading-tight uppercase
                          rounded-full shadow-md hover:bg-gray-700"
                          onClick={() =>
                            setGlobalState('updateModal', 'scale-100')
                          }
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="inline-block px-6 py-2.5 bg-red-600
                          text-white font-medium text-xs leading-tight uppercase
                          rounded-full shadow-md hover:bg-red-700"
                          onClick={() =>
                            setGlobalState('deleteModal', 'scale-100')
                          }
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="inline-block px-6 py-2.5 bg-gray-600
                        text-white font-medium text-xs leading-tight uppercase
                        rounded-full shadow-md hover:bg-gray-700"
                      >
                        Mission Closed
                      </button>
                    )
                  ) : null
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MissionDetails
