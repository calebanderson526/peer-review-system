// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./IERC20.sol";
import "./ReentrancyGuard.sol";
import "./ISemaphore.sol";

contract PeerReview is ReentrancyGuard {
    // address fees are paid out to
    address public feeReceiver = 0x43d669fef45dDc14dF6AffCfc0271CE16F283844;

    ISemaphore public semaphore;
    uint256 public hasReviewedGroupId = 1;

    // fee instance variables
    uint256 public platformFeeBasisPoints = 1;
    uint256 public editorFeeBasisPoints = 14;
    uint256 constant public MAX_EDITOR_FEE = 40;
    uint256 constant public MAX_PLATFORM_FEE = 10;

    // mapping for admin access control
    mapping(address => bool) admins;

    /*
     @notice data schema for bounties
     @param id id of bounty
     @param author author of article for the bounty
     @param editor editor of the journal for the bounty
     @param reviewers reviewers for the bounty
     @param article_link link to article for the bounty
     @param review_links links to reviews for the bounty
     @param token address of token used for bounty reward
     @param amount reward amount
     @param open flag to show if bounty is open
     @param passed flag to show if bounty passed
    */
    struct Bounty {
        uint256 id;
        address author;
        address editor;
        address[] reviewers;
        bytes32 article_link;
        bytes32[] review_links;
        address token;
        uint256 amount;
        bool open;
        bool passed;
        uint gen_time;
    } 

    // list of all bounties
    Bounty[] public bounties;

    // mapping for reputation tracking
    mapping(address => uint256) public addressToReputation;
    uint256[] public identities;

    // mappings for getting bounties for addresses
    mapping(address => uint256[]) authorBountyIds;
    mapping(address => uint256[]) reviewerBountyIds;
    mapping(address => uint256[]) editorBountyIds;

    // Mapping to monitor force closings 
    mapping(uint256 => mapping(address => bool)) forceCloseIds;

    // mapping to keep track of claimed addresses for a bounty
    mapping(uint256 => mapping(address => bool)) hasClaimed;


    // emits when a new bounty is created
    event BountyOpened(
        Bounty bounty
    );

    // emits when a bounty is claimed
    event BountyClaimed(
        Bounty bounty
    );

    // emits when a bounty is closed
    event BountyClosed(
        Bounty bounty
    );

    // emits when a bounty is cancelled
    event BountyCancelled(
        Bounty bounty
    );

    // emits when an admin is added
    event AdminAdded(
        address admin,
        address sender
    );

    // emits when an admin is removed
    event AdminRevoked(
        address revoked,
        address sender
    );
    modifier onlyAdmin {
      require(admins[msg.sender], "not admin");
      _;
   }

    /*
     @notice constructor adds deployer address to admins
    */
    constructor(address semaphoreAddress) {
        admins[msg.sender] = true;
        semaphore = ISemaphore(semaphoreAddress);

        semaphore.createGroup(hasReviewedGroupId, 20, address(this));
    }

    /*
     @notice getter for all the bounties
     @return Bounty[] list of all bounties
    */
    function allBounties() public view returns(Bounty[] memory) {
        return bounties;
    }

    function allIdentities() public view returns(uint256[] memory) {
        return identities;
    }

    /*
     @notice function to get a bounty
     @param _bountyId id of bounty
     @return desired bounty
    */
    function getBounty(uint256 _bountyId) public view returns(Bounty memory) {
        return bounties[_bountyId];
    }

    /*
     @notice Calculates all bounties existing for an author's address
     @param _account is the address of the account you wish to find the bounties for
     @return Bounty[] list of Bounties for the account
    */
    function getBountiesByAuthor(address _account) public view returns(Bounty[] memory) {
        // Create lists
        uint256[] memory ids = authorBountyIds[_account];
        Bounty[] memory ret = new Bounty[](ids.length);

        // Loops through the bounties to create return lists
        for(uint i = 0; i < ids.length; i++) {
            ret[i] = bounties[ids[i]];
        }

        // Returns the list of bounties and claim statuses
        return ret;
    }

    /*
     @notice Calculates all  bounties existing for a reviewer's address
     @param _account is the address of the account you wish to find the bounties for
     @return Bounty[] list of  Bounties for the account, bool[] list of bounty statuses
    */
    function getBountiesByReviewer(address _account) public view returns(Bounty[] memory, bool[] memory) {
        uint256[] memory ids = reviewerBountyIds[_account];
        Bounty[] memory ret = new Bounty[](ids.length);
        bool[] memory claim_status = new bool[](ids.length);
        
        for(uint i = 0; i < ids.length; i++) {
            ret[i] = bounties[ids[i]];
            claim_status[i] = hasClaimed[ids[i]][_account];
        }
        
        return (ret, claim_status);
    }

    /*
     @notice Calculates all bounties existing for an editor's address
     @param _account is the address of the account you wish to find the bounties for
     @return Bounty[] list of Bounties for the account
    */
    function getBountiesByEditor(address _account) public view returns(Bounty[] memory) {
        uint256[] memory ids = editorBountyIds[_account];
        Bounty[] memory ret = new Bounty[](ids.length);
        
        for(uint i = 0; i < ids.length; i++) {
            ret[i] = bounties[ids[i]];
        }
        
        return ret;
    }

    /*
     @notice Opens a bounty on an article
     @param _token address of the token used for the reward
     @param _reviewers list of addresses that are allowed to submit
     @param _amount reward amount for each reviewer
     @param _article_link ipfs link for the article
     @return Bounty bounty that is opened
     emits BountyOpened
    */
    function openBounty(address _token, address _editor, uint256 _amount, bytes32 _article_link) public returns(Bounty memory) {
        Bounty memory bounty;
        bounty.id = bounties.length;
        bounty.author = msg.sender;
        bounty.editor = _editor;
        bounty.article_link = _article_link;
        bounty.passed = false;
        bounty.open = true;
        bounty.amount = _amount;
        bounty.token = _token;
        bounty.gen_time = block.timestamp;
        bounties.push(bounty);

        authorBountyIds[msg.sender].push(bounty.id);
        editorBountyIds[_editor].push(bounty.id);

        IERC20 token = IERC20(_token);
        token.transferFrom(msg.sender, address(this), _amount);

        emit BountyOpened(bounty);
        return bounty;
    }

    /*
     @notice adds reviewers to a bounty
     @param reviewers list of addresses to add as reviewer
     @param _bountyId id of bounty to add reviewers to
     @return Bounty bounty that reviewers are added to
    */
    function addReviewersToBounty(uint256 _bountyId, address[] memory reviewers) public returns (Bounty memory) {
        Bounty memory bounty = bounties[_bountyId];
        
        require(bounty.open, "not open");
        require(bounty.editor == msg.sender, "not editor");
        require(bounty.review_links.length == 0, "reviews submitted");
        
        for(uint i = 0; i < reviewers.length; i++) {
            bounties[_bountyId].reviewers.push(reviewers[i]);
            reviewerBountyIds[reviewers[i]].push(_bountyId);
        }
        
        return bounty;
    }

    /*
     @notice function to claim reward for a reviewer's submission
     @param _bountyId id of bounty to be claimed
     @param _review_link ipfs link for the rev.
     @return Bounty bounty that is claimed
     emits BountyClaimed
    */
    function claimBounty(uint256 _bountyId, bytes32 _review_link, uint256 identityCommitment) public nonReentrant returns(Bounty memory) {
        bool isAuthorized = false;
        
        Bounty memory bounty = bounties[_bountyId];
        
        for (uint i = 0; i < bounty.reviewers.length; i++) {
            if (msg.sender == bounty.reviewers[i]) {
                isAuthorized = true;
            }
        }
        
        require(isAuthorized, "not reviewer");
        require(bounty.open, "not open");
        require(!hasClaimed[_bountyId][msg.sender], "has claimed");
        
        hasClaimed[_bountyId][msg.sender] = true;
        bounties[_bountyId].review_links.push(_review_link);
        
        uint256 rewardAmt = bounty.amount / bounty.reviewers.length * (100 - editorFeeBasisPoints - platformFeeBasisPoints) / 100;
        IERC20(bounty.token).transfer(msg.sender, rewardAmt);
        
        semaphore.addMember(hasReviewedGroupId, identityCommitment);
        identities.push(identityCommitment);

        emit BountyClaimed(bounties[_bountyId]);
        return bounty;
    }

    /*
     @notice function for editor to close a bounty
     @param _bountyID id of bounty to be closed
     @param passed result of validation process
     @return Bounty bounty that is closed
     emits BountyClosed
    */
    function closeBounty(uint256 _bountyId, bool passed) public nonReentrant returns(Bounty memory) {
        Bounty memory bounty = bounties[_bountyId];
        require(msg.sender == bounty.editor, "not editor");
        require(bounty.open, "not open");
        require(bounty.reviewers.length != 0, "no assignees");
        require(bounty.reviewers.length == bounty.review_links.length, "not complete");
        bounties[_bountyId].open = false;
        bounties[_bountyId].passed = passed;

        IERC20 token = IERC20(bounty.token);
        token.transfer(feeReceiver, bounty.amount * platformFeeBasisPoints / 100);
        token.transfer(bounty.editor, bounty.amount * editorFeeBasisPoints / 100);

        emit BountyClosed(bounties[_bountyId]);
        return bounties[_bountyId];
    }

    /*
     @notice function for author to cancel a bounty
     @param _bountyId id of bounty to be canceled
     emits BountyCancelled
    */
    function cancelBounty(uint256 _bountyId) public returns(Bounty memory) {
        Bounty memory bounty = bounties[_bountyId];
        require(bounty.open, "not open");
        require(msg.sender == bounty.author, "not author");
        require(bounty.review_links.length == 0, "reviews submitted");
        // contract does not take a fee when bounty is cancelled
        IERC20(bounty.token).transfer(msg.sender, bounty.amount);

        bounties[_bountyId].open = false;
        emit BountyCancelled(bounties[_bountyId]);
        return bounty;
    }

    /*
     @notice function for author and editor to close a bounty with reviews
     @param _bountyId id of bounty to be canceled
     emits BountyClosed
    */
    function forceCancelBounty(uint256 _bountyId) public returns(Bounty memory) {
        // Access the list of bounties
        Bounty memory bounty = bounties[_bountyId];

        // Perform exception checks
        require(bounty.open, "not open");
        require(msg.sender == bounty.author || msg.sender == bounty.editor, "not author/editor");
        require(bounty.review_links.length > 0, "no reviews");

        // Validtate that either party requested cancelation
        forceCloseIds[_bountyId][msg.sender] = true;

        // Checks both parties have requested cancelation
        if (forceCloseIds[_bountyId][bounty.author] && forceCloseIds[_bountyId][bounty.editor]) {
            // Create token transfer ammounts
            uint256 editorFee = bounty.amount * (editorFeeBasisPoints / 2) / 100;
            uint256 platformFee = bounty.amount * platformFeeBasisPoints / 100;
            uint256 refundAmount = bounty.amount - editorFee - platformFee - (bounty.amount / bounty.reviewers.length * bounty.review_links.length);
            
            // Initialize token
            IERC20 token = IERC20(bounty.token);
            
            // Direct fees to the appropriate locations
            token.transfer(bounty.editor, editorFee);
            token.transfer(feeReceiver, platformFee);
            token.transfer(bounty.author, refundAmount);

            // Close bounty on chain and emit BountyClosed
            bounties[_bountyId].open = false;
            emit BountyClosed(bounties[_bountyId]);
        }

        // Returns the bounty
        return bounty;
    }

    /*
     @notice function for a reviewer to claim their reputation
     @param greeting greeting for the semaphore proof
     @param merkleTreeRoot root of the has reviewed group merkle tree
     @param nullifierHash nullifier hash of proof
     @param proof the proof
    */
    function claimReputation(
        bytes32 greeting, 
        uint256 merkleTreeRoot, 
        uint256 nullifierHash, 
        uint256[8] calldata proof
    ) external {
        semaphore.verifyProof(hasReviewedGroupId, merkleTreeRoot, uint256(greeting), nullifierHash, hasReviewedGroupId, proof);
        addressToReputation[msg.sender] += 1;
    }

    /*
     @notice function to add an admin to the contract
     @param _account account to be given admin privilledges
     emits AdminAdded
    */
    function addAdmin(address _account) public onlyAdmin {
        admins[_account] = true;
        emit AdminAdded(_account, msg.sender);
    }

    /*
     @notice function to revoke admin access
     @param _account address to revoke admin privilledges from
     emits AdminRevoked
    */
    function revokeAdmin(address _account) public onlyAdmin {
        admins[_account] = false;
        emit AdminRevoked(_account, msg.sender);
    }

    /*
     @notice function to rescue native tokens to sender
    */
    function recoverNative() public onlyAdmin {
        payable(msg.sender).transfer(address(this).balance);
    }

    /*
     @notice function to rescue erc20 tokens to sender
     @param _tokenAddress address of token to be recovered
     @param _amount amount of token to be recovered
    */
    function recoverTokens(address _tokenAddress, uint256 _amount) public onlyAdmin {
		IERC20 token = IERC20(_tokenAddress);
		token.transfer(msg.sender, _amount);
	}

    /*
     @notice function to set editor fee basis points
     @param _fee basis points for new fee
    */
    function setEditorFee(uint256 _fee) public onlyAdmin {
        require(_fee < MAX_EDITOR_FEE, "too high");
        editorFeeBasisPoints = _fee;
    }

    /*
     @notice function to set platform fee basis points
     @param _fee basis points for new fee
    */
    function setPlatformFee(uint256 _fee) public onlyAdmin {
        require(_fee < MAX_PLATFORM_FEE, "too high");
        platformFeeBasisPoints = _fee;
    }
}