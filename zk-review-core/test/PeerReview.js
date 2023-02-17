const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, run } = require("hardhat");
const { Identity } = require("@semaphore-protocol/identity");
const { Group } = require("@semaphore-protocol/group");
const { generateProof } = require("@semaphore-protocol/proof");

describe("Peer Review Contract", function () {

    // Peer Review contract setup with token fixture to be called in tests
    async function deployPRWithTokenFixture() {
        const { semaphore } = await run("deploy:semaphore");
        const semaphoreAddress = await semaphore.address;
        const PeerReview = await ethers.getContractFactory("PeerReview");
        const [owner, addr1, addr2] = await ethers.getSigners();
        const PRContract = await PeerReview.deploy(semaphoreAddress);
        await PRContract.deployed();

        const Token = await ethers.getContractFactory("TestToken");
        const hardhatToken = await Token.deploy();
        await hardhatToken.deployed();

        // this is needed otherwise the peer review contract can't transfer tokens from the author's wallet
        hardhatToken.approve(PRContract.address, 10000);

        return { PRContract, owner, addr1, addr2, PeerReview, Token, hardhatToken }
    }

    

    // deploys peer review contract with a token and bounty
    async function deployWithBountyFixture() {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployPRWithTokenFixture);
        await PRContract.openBounty(
            hardhatToken.address,
            addr1.address,
            1000,
            ethers.utils.formatBytes32String("google.com")
        );
        const bounty = await PRContract.getBounty(0);
        return { PRContract, owner, hardhatToken, addr1, addr2, bounty }
    }


    it("Should open bounty with functioning parameters, and getters should access correct state", async function () {
        const { PRContract, owner, hardhatToken, addr1 } = await loadFixture(deployPRWithTokenFixture);

        const openTx = await expect(PRContract.openBounty(
            hardhatToken.address,
            addr1.address,
            20,
            ethers.utils.formatBytes32String("google.com")
        )).to.emit(PRContract, "BountyOpened");

        // ensure parameters have been initiated
        const bounty = await PRContract.getBounty(0);
        expect(bounty.amount).to.equal(20);
        expect(bounty.editor).to.equal(addr1.address);
        expect(bounty.token).to.equal(hardhatToken.address);

        var byte32str = ethers.utils.formatBytes32String("google.com")
        expect(bounty.article_link).to.equal(byte32str);

        // must assign to the correct author
        const authorBounties = await PRContract.getBountiesByAuthor(owner.address);
        const tmp = authorBounties[0];
        expect(authorBounties[0].id).to.equal(bounty.id);

        // must assign to the correct editor
        const editorBounties = await PRContract.getBountiesByEditor(addr1.address);
        expect(editorBounties[0].id).to.equal(bounty.id);

        // ${amount} tokens must be transferred to contract
        const contract_balance = await hardhatToken.balanceOf(PRContract.address)
        expect(contract_balance).to.equal(20);
    });

    /*
    * ----------------------------------------
    * Test cancelBounty
    * ----------------------------------------
    */
    it("An open bounty can be canceled by the author if no reviews are made, and should update the blockchain", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);
        /*
        * ------------------------------------------------
        * Cancel the first bounty and check emit
        * ------------------------------------------------
        */
        await expect(PRContract.cancelBounty(0)).to.emit(PRContract, 'BountyCancelled');
        const firstBounty = await PRContract.getBounty(0);

        /*
        * ------------------------------------------------
        * Verify balance of contract and owner
        * ------------------------------------------------
        */
        const owner_cancel_balance = await hardhatToken.balanceOf(owner.address);
        const contract_cancel_balance = await hardhatToken.balanceOf(PRContract.address);

        const ethToWei = ethers.utils.parseUnits("100", "ether")

        await expect(contract_cancel_balance).to.equal(0);
        await expect(owner_cancel_balance).to.equal(ethToWei);

        // Enusre canceled bounty has the correct open state
        expect(firstBounty.open).to.equal(false);

        /*
        * ------------------------------------------------
        * Fail canceling a closed bounty
        * ------------------------------------------------
        */
        await expect(PRContract.cancelBounty(0)).to.be.revertedWith("not open");

        /*
        * ------------------------------------------------
        * Fail canceling a bounty not owned by the author
        * ------------------------------------------------
        */
        // Create a new bounty
        const openTx = await PRContract.openBounty(
            hardhatToken.address,
            addr1.address,
            20,
            ethers.utils.formatBytes32String("python.org")
        );

        // Attempt to cancel the bounty
        await expect(PRContract.connect(addr1).cancelBounty(1)).to.be.revertedWith("not author");

        /*
        * ------------------------------------------------
        * Fail canceling a bounty with reviews on it
        * ------------------------------------------------
        */
        // Assign a reviewer
        var identity = new Identity();
        await PRContract.connect(addr1).addReviewersToBounty(1, [addr2.address]);
        await PRContract.connect(addr2).claimBounty(
            1, await ethers.utils.formatBytes32String("python.org"), identity.commitment
        )

        // Attempt to cancel
        await expect(PRContract.cancelBounty(1)).to.be.revertedWith("reviews submitted");


    });


    /*
    * ----------------------------------------
    * Test addReviewersToBounty()
    * ----------------------------------------
    */
    // FAIL if author tries to add to bounty
    it("Should only allow editor to add to bounty", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);
        await expect(PRContract.addReviewersToBounty(0, [addr2.address])).to.be.revertedWith("not editor");
    });

    // FAIL if bounty is already closed
    it("Should fail if the bounty is closed", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);

        PRContract.cancelBounty(0);
        await expect(PRContract.addReviewersToBounty(0, [addr2.address])).to.be.revertedWith("not open")
    });

    // FAIL if a reviewer has already submitted a review
    it("Should fail if a reviewer has already submitted a review", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);

        // Assign a reviewer
        var identity = new Identity();
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr2.address]);
        await PRContract.connect(addr2).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity.commitment);     

        await expect(PRContract.connect(addr1).addReviewersToBounty(0, [addr2.address])).to.be.revertedWith("reviews submitted");
    });

    // Should properly update the bounty in the bounties list on the contract
    it("Should properly update the bounty in the bounties list on the contract", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);

        // Assign a reviewer
        var identity = new Identity();
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr2.address]);
        await PRContract.connect(addr2).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity.commitment);

        const bounty = await PRContract.getBounty(0);

        // FAIL if cannot properly update the bounty in the bounties list on the contract
        await expect(bounty.reviewers[0]).to.equal(addr2.address);

        // FAIL if cannot properly update the reviewerToBountyIds mapping
        const rev = await PRContract.getBountiesByReviewer(addr2.address);
        await expect(rev[0][0].id).to.equal(0);
    });

    /*
    * ------------------------------------------------
    * Test claimBounty()
    * ------------------------------------------------
    */
 it("Should claim bounty reward for a user submission as long as the bounty is open and has not been claimed", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);

        // Assign a reviewer
        var identity = new Identity();
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr2.address]);
        await PRContract.connect(addr2).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity.commitment);

        var identity2 = new Identity();
        await expect(PRContract.connect(addr1).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity2.commitment)).to.be.revertedWith("not reviewer");
    });

    // FAIL if incorrect transfer of 
    // (amount / reviewers.length) * 0.84 tokens into the reviewer's account
    it("Should transfer correct amount into reviewer account", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2, bounty } = await loadFixture(deployWithBountyFixture);

        // Assign a reviewer
        var identity = new Identity();
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr1.address]);
        await PRContract.connect(addr1).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity.commitment);

        var updated_bounty = await PRContract.getBounty(0);
        const revBalance = await hardhatToken.balanceOf(addr1.address);
        var expected = updated_bounty.amount / updated_bounty.reviewers.length * 85 / 100;
        expect(revBalance).to.equal(Math.round(expected)); 
        

    });

    // FAIL if Sender has already claimed the bounty
    it("Should not allow a reviewer to claim a bounty more than once", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);

        // Assign a reviewer
        var identity1 = new Identity() 
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr2.address]);
        await PRContract.connect(addr2).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity1.commitment);
        
        var identity2 = new Identity()
        await expect(PRContract.connect(addr2).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity2.commitment)).to.be.revertedWith("has claimed");
    });

    // FAIL if bounty is already closed
    it("Sould not be able to claim bounty if already closed", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);

        // Assign a reviewer
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr2.address]);

        await PRContract.cancelBounty(0);
        var identity = new Identity();
        await expect(PRContract.connect(addr2).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity.commitment)).to.be.revertedWith("not open");
    });

    // FAIL if cannot properly update the bounty's state on chain
    it("Should properly update teh bounty's state on the chain", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);


        // Assign a reviewer
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr2.address]);

        // checks if emits BountyClaimed
        var identity = new Identity();
        await expect(PRContract.connect(addr2).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity.commitment)).to.emit(PRContract, "BountyClaimed");
    });

    /*
    * ------------------------------------------------
    * Test closeBounty()
    * ------------------------------------------------
    */
    // FAIL if non-editor tries to close the bounty
    it("Should only allow editor to close to bounty", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);

        var identity = new Identity();
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr2.address]);
        await PRContract.connect(addr2).claimBounty(0,ethers.utils.formatBytes32String("python.org"), identity.commitment);

        await expect(PRContract.connect(addr2).closeBounty(0, true)).to.be.revertedWith("not editor");
    });

    // FAIL if bounty is already closed
    it("Cannot close a bounty that has been closed", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);

        await expect(PRContract.connect(addr1).closeBounty(0, true)).to.be.revertedWith("no assignees");

        await PRContract.connect(addr1).addReviewersToBounty(0, [addr2.address]);
        var identity = new Identity();
        await PRContract.connect(addr2).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity.commitment);

        // fail if already closed
        await PRContract.connect(addr1).closeBounty(0, true);
        await expect(PRContract.connect(addr1).closeBounty(0, true)).to.be.revertedWith("not open");

    });

    // FAIL if incorrect transfer of 
    // amount * .14 tokens into the editors account
    // amount * 0.01 into the fee receiver account
    it("Should transfer correct amount into reviewer and editor account", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2, bounty, editor } = await loadFixture(deployWithBountyFixture);

        // Assign a reviewer, claim and close bounty.
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr1.address]);
        var identity1 = new Identity();
        await PRContract.connect(addr1).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity1.commitment);
        const editor_bal1 = await hardhatToken.balanceOf(addr1.address);
        const owner_bal1 = await hardhatToken.balanceOf('0x43d669fef45dDc14dF6AffCfc0271CE16F283844');
        await PRContract.connect(addr1).closeBounty(0, true);

        // update balances and compare to expected value
        var updated_bounty = await PRContract.getBounty(0);
        const editor_bal2 = await hardhatToken.balanceOf(addr1.address);
        const owner_bal2 = await hardhatToken.balanceOf('0x43d669fef45dDc14dF6AffCfc0271CE16F283844');
        var dif1 = editor_bal2 - editor_bal1;
        var dif2 = owner_bal2 - owner_bal1;
        var editor_ex = (updated_bounty.amount * 14 / 100);
        var owner_ex = (updated_bounty.amount * 1 / 100);
        expect(editor_bal2 - editor_bal1).to.equal(Math.round(editor_ex)); 
        expect(owner_bal2 - owner_bal1).to.equal(Math.round(owner_ex)); 

    });

    // Fail if not all reviews are submitted for the bounty
    it("Should fail if not all reviews are submitted for the bounty", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);

        // Assign two reviewers but only claim one bounty
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr2.address]);
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr2.address]);
        
        var identity = new Identity();
        await PRContract.connect(addr2).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity.commitment);

        await expect(PRContract.connect(addr1).closeBounty(0, true)).to.be.revertedWith("not complete");

        // Open new bounty
        await PRContract.openBounty(
            hardhatToken.address,
            addr1.address,
            20,
            ethers.utils.formatBytes32String("google.com")
        );

        // Claim anc close the bounty to emit BountyClosed
        await PRContract.connect(addr1).addReviewersToBounty(1, [addr2.address]);
        var identity2 = new Identity();
        await PRContract.connect(addr2).claimBounty(1, ethers.utils.formatBytes32String("python.org"), identity2.commitment);
        await expect(PRContract.connect(addr1).closeBounty(1, true)).to.emit(PRContract, 'BountyClosed');
    });

    /*
    * ------------------------------------------------
    * Test Admin Access Control
    * ------------------------------------------------
    */
    it("Should fail if Access Control tests do not pass", async function () {
    const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);

        // Contract deployer should be admin
        // Wont fail if delpoyer is the admin.
        await PRContract.setEditorFee(5);
        // FAIL if non-admin calls admin-only function
        await expect(PRContract.connect(addr2).setEditorFee(5)).to.be.revertedWith("not admin");
    

        // Only admin should be able to call revoke and add admin
        // FAil if non-admin tries to add themselves as admin
        await expect(PRContract.connect(addr2).addAdmin(addr2.address)).to.be.revertedWith("not admin");
        // FAIL if non-admin tries to revoke an admin
        await expect(PRContract.connect(addr2).revokeAdmin(owner.address)).to.be.revertedWith("not admin");
    

        // Revoke and add admin should emit revoke/add admin respectively
        // Emit AdminAdded
        await expect(PRContract.connect(owner).addAdmin(addr1.address)).to.emit(PRContract, 'AdminAdded');

        // Emit AdminRevoked
        await expect(PRContract.connect(owner).revokeAdmin(addr1.address)).to.emit(PRContract, 'AdminRevoked');


        // Only admin should be able to call recoverNative and recoverTokens
        // FAIL if non-admin calls recoverNative
        await expect(PRContract.connect(addr1).recoverNative()).to.be.revertedWith("not admin");

        // FAIL if non-admin calls recoverTokens
        await expect(PRContract.connect(addr1).recoverTokens(addr1.address, 0)).to.be.revertedWith("not admin");

        // recoverNative should be transfer all eth in contract to admin's account
        // await PRContract.addAdmin(addr1.address);
        // await owner.sendTransaction({
        // to: PRContract.address,
        // value: ethers.utils.parseEther("1.0", "ether"), // Sends exactly 1.0 ether
        // });
        await PRContract.addAdmin(addr1.address);
        await PRContract.connect(addr1).recoverNative();
        const eth_balance = await hardhatToken.balanceOf(addr1.address);
        const ethWei = ethers.utils.parseUnits("0", "ether");
        expect(eth_balance).to.equal(ethWei);


        // recoverTokens should transfer amount tokens to admin account
        await PRContract.connect(addr1).recoverTokens(hardhatToken.address, 20);
        const admin_balance = await hardhatToken.balanceOf(addr1.address);
        expect(admin_balance).to.equal(20); 
    });

       /*
    * ------------------------------------------------
    * Test getBountiesByReviewer()
    * ------------------------------------------------
    */
       it("Should fail if Get Bounties By Reviewers tests do not pass", async function () {
        const { PRContract, owner, hardhatToken, addr1, addr2 } = await loadFixture(deployWithBountyFixture);
        //add reviewers to bounty
        await PRContract.connect(addr1).addReviewersToBounty(0,[addr2.address]);
        //check count of bounties
        const reviewerBounties = await PRContract.getBountiesByReviewer(addr2.address);
        //expect bounty to still be open
        await expect(reviewerBounties[1][0]).to.equal(false);
        //claim bounty that closes it
        var identity = new Identity();
        await PRContract.connect(addr2).claimBounty(0, ethers.utils.formatBytes32String("python.org"), identity.commitment);
        //update the value 
        const updateReviewerBounty = await PRContract.getBountiesByReviewer(addr2.address);
        //expect bounty to be closed
        await expect(updateReviewerBounty[1][0]).to.equal(true);
    });

    it("Should allow a reviewer to claim reputation and increment on chain", async function() {
        const { PRContract, owner, hardhatToken, addr1, addr2, bounty, editor } = await loadFixture(deployWithBountyFixture);

        // Assign a reviewer, claim and close bounty.
        await PRContract.connect(addr1).addReviewersToBounty(0, [addr1.address]);
        var identity1 = new Identity();
        await PRContract.connect(addr1).claimBounty(
            0, 
            ethers.utils.formatBytes32String("python.org"), 
            identity1.commitment
        
        );
        const group = new Group(1);
        group.addMember(identity1.commitment);

        // verify the proof
        const wasmFilePath = "./static/semaphore.wasm";
        const zkeyFilePath = "./static/semaphore.zkey";
        const greeting = ethers.utils.formatBytes32String("hi");

        const fullProof = await generateProof(identity1, group, 1, greeting, {
            wasmFilePath,
            zkeyFilePath
        });
        
        const tx = await PRContract.connect(addr2).claimReputation(
            greeting,
            fullProof.merkleTreeRoot,
            fullProof.nullifierHash,
            fullProof.proof
        );

        expect(await PRContract.addressToReputation(addr2.address)).to.equal(1);
    });
});






