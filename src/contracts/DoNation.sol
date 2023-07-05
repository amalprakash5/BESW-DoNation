//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract DoNation {
    address public owner;
    uint public missionTax;
    uint public missionCount;
    uint public balance;
    statsStruct public stats;
    missionStruct[] missions;

    mapping(address => missionStruct[]) missionsOf;
    mapping(uint => supporterStruct[]) supportersOf;
    mapping(uint => bool) public missionExist;

    enum statusEnum {
        OPEN,
        APPROVED,
        REVERTED,
        DELETED,
        PAIDOUT
    }

    struct statsStruct {
        uint totalMissions;
        uint totalSupporting;
        uint totalDonations;
    }

    struct supporterStruct {
        address owner;
        uint contribution;
        uint timestamp;
        bool refunded;
    }

    struct missionStruct {
        uint id;
        address owner;
        string title;
        string description;
        string imageURL;
        uint cost;
        uint raised;
        uint timestamp;
        uint expiresAt;
        uint supporters;
        statusEnum status;
    }

    modifier ownerOnly() {
        require(msg.sender == owner, "Owner reserved only");
        _;
    }

    event Action(
        uint256 id,
        string actionType,
        address indexed executor,
        uint256 timestamp
    );

    constructor(uint _missionTax) {
        owner = msg.sender;
        missionTax = _missionTax;
    }

    function createMission(
        string memory title,
        string memory description,
        string memory imageURL,
        uint cost,
        uint expiresAt
    ) public returns (bool) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(imageURL).length > 0, "ImageURL cannot be empty");
        require(cost > 0 ether, "Cost cannot be zero");

        missionStruct memory mission;
        mission.id = missionCount;
        mission.owner = msg.sender;
        mission.title = title;
        mission.description = description;
        mission.imageURL = imageURL;
        mission.cost = cost;
        mission.timestamp = block.timestamp;
        mission.expiresAt = expiresAt;

        missions.push(mission);
        missionExist[missionCount] = true;
        missionsOf[msg.sender].push(mission);
        stats.totalMissions += 1;

        emit Action(
            missionCount++,
            "PROJECT CREATED",
            msg.sender,
            block.timestamp
        );
        return true;
    }

    function updateMission(
        uint id,
        string memory title,
        string memory description,
        string memory imageURL,
        uint expiresAt
    ) public returns (bool) {
        require(msg.sender == missions[id].owner, "Unauthorized Entity");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(imageURL).length > 0, "ImageURL cannot be empty");

        missions[id].title = title;
        missions[id].description = description;
        missions[id].imageURL = imageURL;
        missions[id].expiresAt = expiresAt;

        emit Action(id, "PROJECT UPDATED", msg.sender, block.timestamp);

        return true;
    }

    function deleteMission(uint id) public returns (bool) {
        require(
            missions[id].status == statusEnum.OPEN,
            "Mission no longer opened"
        );
        require(msg.sender == missions[id].owner, "Unauthorized Entity");

        missions[id].status = statusEnum.DELETED;
        performRefund(id);

        emit Action(id, "PROJECT DELETED", msg.sender, block.timestamp);

        return true;
    }

    function performRefund(uint id) internal {
        for (uint i = 0; i < supportersOf[id].length; i++) {
            address _owner = supportersOf[id][i].owner;
            uint _contribution = supportersOf[id][i].contribution;

            supportersOf[id][i].refunded = true;
            supportersOf[id][i].timestamp = block.timestamp;
            payTo(_owner, _contribution);

            stats.totalSupporting -= 1;
            stats.totalDonations -= _contribution;
        }
    }

    function supportMission(uint id) public payable returns (bool) {
        require(msg.value > 0 ether, "Ether must be greater than zero");
        require(missionExist[id], "Mission not found");
        require(
            missions[id].status == statusEnum.OPEN,
            "Mission no longer opened"
        );

        stats.totalSupporting += 1;
        stats.totalDonations += msg.value;
        missions[id].raised += msg.value;
        missions[id].supporters += 1;

        supportersOf[id].push(
            supporterStruct(msg.sender, msg.value, block.timestamp, false)
        );

        emit Action(id, "PROJECT BACKED", msg.sender, block.timestamp);

        if (missions[id].raised >= missions[id].cost) {
            missions[id].status = statusEnum.APPROVED;
            balance += missions[id].raised;
            performPayout(id);
            return true;
        }

        if (block.timestamp >= missions[id].expiresAt) {
            missions[id].status = statusEnum.REVERTED;
            performRefund(id);
            return true;
        }

        return true;
    }

    function performPayout(uint id) internal {
        uint raised = missions[id].raised;
        uint tax = (raised * missionTax) / 100;

        missions[id].status = statusEnum.PAIDOUT;

        payTo(missions[id].owner, (raised - tax));
        payTo(owner, tax);

        balance -= missions[id].raised;

        emit Action(id, "PROJECT PAID OUT", msg.sender, block.timestamp);
    }

    function requestRefund(uint id) public returns (bool) {
        require(
            missions[id].status != statusEnum.REVERTED ||
                missions[id].status != statusEnum.DELETED,
            "Mission not marked as revert or delete"
        );

        missions[id].status = statusEnum.REVERTED;
        performRefund(id);
        return true;
    }

    function payOutMission(uint id) public returns (bool) {
        require(
            missions[id].status == statusEnum.APPROVED,
            "Mission not APPROVED"
        );
        require(
            msg.sender == missions[id].owner || msg.sender == owner,
            "Unauthorized Entity"
        );

        performPayout(id);
        return true;
    }

    function changeTax(uint _taxPct) public ownerOnly {
        missionTax = _taxPct;
    }

    function getMission(uint id) public view returns (missionStruct memory) {
        require(missionExist[id], "Mission not found");

        return missions[id];
    }

    function getMissions() public view returns (missionStruct[] memory) {
        return missions;
    }

    function getSupporters(
        uint id
    ) public view returns (supporterStruct[] memory) {
        return supportersOf[id];
    }

    function payTo(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success);
    }
}
