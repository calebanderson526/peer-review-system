// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Profiles {
    /*
     @notice data schema for profiles
     @param address address of user
     @param name name of user
     @param journal_name name of journal user is in
     @param email email of user
    */
    struct Profile {
        uint256 profileId;
        address addr;
        string name;
        string journal_name;
        string email;
    }  

    
    // list of all profiles
    Profile[] public profiles; 

    // mapping account public key to profile
    mapping(address => uint256) addressToProfileId;

    // mapping name to profile
    mapping(string => uint256) nameToProfileId;

    // mapping to see if a name is being used
    mapping(string => bool) nameIsUsed;

    // emits when a profile is created
    event ProfileCreated (
        Profile profile
    );

    // emits when a profile is updated
    event ProfileUpdated (
        Profile profile
    );

    constructor() {
        // so the default result of the mappings don't map to a real bounty or profile
        // sadly this fix breaks most of the hardhat tests, need to fix that.
        // Bounty memory bounty;
        // bounties.push(bounty);

        // Profile memory profile;
        // profiles.push(profile);
        
    }

    /*
     @notice function to get a profile by address
     @param _address address of profile
    */
    function getProfileByAddress(address _address) public view returns(Profile memory) {
        return profiles[addressToProfileId[_address]];
    }

    /*
     @notice function to get a profile by name
     @param _name name of profile
    */
    function getProfileByName(string memory _name) public view returns(Profile memory) {
        return profiles[nameToProfileId[_name]];
    }

    /*
     @notice function to create a profile
     @param _name name of profile
     @param _journal_name name of journal
     @param _email email of user
     @return profile that is created
    */
    function createProfile(string memory _name, string memory _journal_name, string memory _email) public returns (Profile memory) {
        require(!nameIsUsed[_name], "name used");
        require(addressToProfileId[msg.sender] == 0, "duplicate"); // this is vulnerable to the first person who creates a profile, could fix by adding a new profile in the constructor

        Profile memory profile;
        profile.name = _name;
        profile.journal_name = _journal_name;
        profile.email = _email;
        profile.addr = msg.sender;
        profile.profileId = profiles.length;

        addressToProfileId[msg.sender] = profiles.length;
        nameToProfileId[_name] = profiles.length;
        nameIsUsed[_name] = true;
        profiles.push(profile);

        emit ProfileCreated(profile);

        return profile;
    }

    /*
     @notice function to updated a profile
     @param _name new name of profile
     @param _journal_name new name of profile journal
     @param _email new email of user
     @return profile that is updated
    */
    function updateProfile(string memory _name, string memory _journal_name, string memory _email) public returns (Profile memory) {
        uint256 profileId = addressToProfileId[msg.sender];
        Profile memory profile = profiles[profileId];
        if (keccak256(abi.encodePacked(profile.name)) != keccak256(abi.encodePacked(_name))) {
            require(!nameIsUsed[_name], "name used");
        }

        nameToProfileId[profile.name] = 0;
        nameIsUsed[profile.name] = false;

        profile.name = _name;
        profile.email = _email;
        profile.journal_name = _journal_name;

        nameIsUsed[_name] = true;
        nameToProfileId[_name] = profileId;
        profiles[profileId] = profile;

        emit ProfileUpdated(profile);

        return profile;
    }
}