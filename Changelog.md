# Peer Review Blockchain Changelog

This project uses semantic versioning in the format of: `X.Y.Z`, where:

* `X`: Major Updates and breaking changes
* `Y`: Minor/feature updates and non-breaking changes
* `Z`: Bug fixes

List tags and issues chronologically at the bottom of the file with the most recent of each at the top of the list. Include an alias and a link to each.

## [0.2.0] - 2022-10-18 - @alcinija, @ander589, @hershbmn, @keunewm, and @vonholnj
* Tag Repo 0.2.0
* Add UI Components
    * Author Page ([Issue-25])
    * Editor Page ([Issue-35])
    * Reviewer Page ([Issue-38])
    * Webpage Header ([Issue-34])
    * Home Page Stats ([Issue-36])
* Add Smart Contract Functionality in `PeerReview.sol`
    * `forceCancelBounty` ([Issue-31])
    * `getBountiesByReviewer` ([Issue-30])
    * Emit `BountyClaimed` in `ClaimedBounty` ([Issue-29])
    * Create Admin Status ([Issue-28])
    * Create User Profiles
* Add Smart Contract Tests
    * `getBountiesByReviewer` ([Issue-33])
* Deploy Smart Contract to goerli test network ([Issue-26]) 
* Start IPFS Node ([Issue-24])
* Create Metamask Testnet Wallet ([Issue-23])
* Create Logos/Branding ([Issue-40])
* Create Class Diagram ([Issue-43])

## [0.1.0] - 2022-10-16 - @alcinija, @ander589, @hershbmn, @keunewm, and @vonholnj
* Tag Repo 0.1.0 ([Issue-27])
* Initialize Repository Dependicies
    * Add `React`
    * Add `React-Bootstrap` ([Issue-1])
    * Add `Boostrap`
    * Add `web3js`
    * Add `Hardhat`
* Add UI Components
    * Refactor `App.js` ([Issue-5])
    * Tabs ([Issue-6])
    * Login Button ([Issue-7])
    * CSS Refactor ([Issue-9])
    * Role Components
        * Author ([Issue-19])
        * Editor ([Issue-20])
        * Reviewer ([Issue-21])
* Add Smart Contract ([Issue-12])
* Add Smart Contract Unit Tests
    * Hardhat Tests for `PeerReview.sol` contract methods
        * `cancelBounty` ([Issue-18])
        * `closeBounty` ([Issue-17])
        * `claimBounty` ([Issue-16])
        * `addReviewersToBounty` ([Issue-15])
* Create Documentation
    * Create Team Working Agreement
    * Create Team Charter
    * Tech Stack Investigation (Google Drive) ([Issue-4])
    * Investigate Data Storage (Google Drive)
        * Subgraph ([Issue-14])
        * IPFS ([Issue-22])
    * Add Diagrams (Google Drive)
        * Architecture ([Issue-10])
        * Use Case ([Issue-11])
        * ERD Data Schema ([Issue-13])
    * Create `Changelog.md` ([Issue-2])
    * Create `ReadME.md` file ([Issue-8])

[0.2.0]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/compare/0.1.0...0.2.0
[0.1.0]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/tree/0.1.0

[Issue-43]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/43
[Issue-40]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/40
[Issue-38]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/38
[Issue-36]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/36
[Issue-35]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/35
[Issue-34]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/34
[Issue-33]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/33
[Issue-31]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/31
[Issue-30]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/30
[Issue-29]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/29
[Issue-28]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/28
[Issue-27]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/27
[Issue-26]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/26
[Issue-25]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/25
[Issue-24]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/24
[Issue-23]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/23
[Issue-22]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/22
[Issue-21]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/21
[Issue-20]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/20
[Issue-19]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/19
[Issue-18]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/18
[Issue-17]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/17
[Issue-16]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/16
[Issue-15]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/15
[Issue-14]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/14
[Issue-13]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/13
[Issue-12]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/12
[Issue-11]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/11
[Issue-10]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/10
[Issue-9]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/9
[Issue-8]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/8
[Issue-7]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/7
[Issue-6]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/6
[Issue-5]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/5
[Issue-4]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/4
[Issue-2]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/2
[Issue-1]: https://gitlab.csi.miamioh.edu/2023-capstone/Alternate_BlockChain_Project/peer-review-system/-/issues/1