const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

describe('Profiles conract', function() {

    async function deployProfileWithProfile() {
        const Profiles = await ethers.getContractFactory("Profiles");
        const [owner, addr1, addr2] = await ethers.getSigners();
        const ProfContract = await Profiles.deploy();
        await ProfContract.deployed()

        ProfContract.createProfile('caleb', 'likes programming', 'bigchungus@aol.com');

        return { ProfContract, owner, addr1, addr2 };
    }


    // i did this to make sure this getter is actually working, this is not a real test
    it("Should return a profile", async function() {
        const { ProfContract, owner, addr1, addr2 } = await loadFixture(deployProfileWithProfile);

        var profile = await ProfContract.getProfileByAddress(owner.address);
    });
});