import "../../style/BountyCardStyle.css";
import React, { useState } from "react";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Ratio from 'react-bootstrap/Ratio';
import IframeResizer from 'iframe-resizer-react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import AddReviewersModal from "../modals/AddReviewersModal";
import SubmitReviewModal from '../modals/submitReviewModal';
import check from '../../static/bigCheck.png';
import bigX from '../../static/bigX.png';
import { Buffer } from 'buffer';
import bs58 from 'bs58'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export default function BountyCard({
    account,
    bounty,
    openFilter,
    closedFilter,
    passedFilter,
    failedFilter,
    PRContract,
    type,
    profile
}) {
    const [confirmation, setConfirmation] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [showOpenReviewer, setShowOpenReviewer] = useState(false);
    const [showOpenReview, setShowOpenReview] = useState(false);

    const isVisible = () => {
        var ret = true;
        if (passedFilter) {
            ret = ret && bounty.passed;
        } else if (closedFilter) {
            ret = ret && !bounty.open;
        } else if (openFilter) {
            ret = ret && bounty.open;
        } else if (failedFilter) {
            ret = ret && !bounty.passed;
        }
        return (ret);
    }

    const handleOpenConfirm = () => {
        setIsConfirming(true);
    }

    const handleCloseConfirm = () => {
        setIsConfirming(false);
    }

    const handleConfirm = async () => {
        var msg = confirmation.toLowerCase()
        if (msg !== 'yes') {
            handleCloseConfirm();
            alert('you did not enter "yes", cannot cancel bounty.');
            return;
        }
        if (type === 'author') {
            PRContract.methods.cancelBounty(
                bounty.id
            ).send({ from: account })
                .on('confirmation', (receipt) => {
                    window.location.reload();
                });
        } else if (type === 'editor') {
            PRContract.methods.closeBounty(
                bounty.id
            ).send({ from: account })
                .on('confirmation', (receipt) => {
                    window.location.reload();
                });;
        }

        setConfirmation('');
        handleCloseConfirm();
    }

    const handleShowOpenReviewer = () => {
        setShowOpenReviewer(true);
    }

    const handleCloseOpenReviewer = () => {
        setShowOpenReviewer(false);
    }

    const handleShowOpenReview = () => {
        if (profile !== null) {
            alert("If you submit a review without changing metamask accounts it will not be private!" +
                "There is a profile associated with the connected ethereum account.")
        }
        setShowOpenReview(true);
    }

    const handleCloseOpenReview = () => {
        setShowOpenReview(false);
    }

    const confirmModal = () => {
        return (
            <Modal
                show={isConfirming}
                onHide={handleCloseConfirm}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Bounty {type === 'author' ? 'Cancellation' : 'Closure'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>
                            <h6>Are you want to {type === 'author' ? 'cancel' : 'close'} the bounty with id: {bounty.id}?</h6>
                        </Col>
                    </Row>
                    <Form onSubmit={(e) => e.preventDefault()}>
                        <Row>
                            <Form.Group as={Col}>
                                <Row>
                                    <Col>
                                        <Form.Label>Enter 'yes' to confirm: </Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type='text'
                                            value={confirmation}
                                            onChange={e => setConfirmation(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Row>
                        <br />
                        <Row className='text-center'>
                            <Col>
                                <Button
                                    size='lg'
                                    variant='danger'
                                    onClick={handleConfirm}
                                >
                                    Confirm
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    }

    const isAuthorDisabled = () => {
        if (bounty.review_links.length > 0 || !bounty.open) {
            return true;
        }
        else {
            return false;
        }
    }
    const authorDisabledString = () => {
        if (!bounty.open) {
            return 'Bounty is closed';
        }
        else if (bounty.review_links.length > 0) {
            return 'Reviews have been submitted';
        }
    }

    const authorContent = () => {
        if (type !== 'author') {
            return ('');
        }
        return (
            <Col md={{ span: 2 }}>
                <OverlayTrigger overlay={isAuthorDisabled() ? <Tooltip id="tooltip-disabled">{authorDisabledString()}</Tooltip> : <div></div>}>
                    <Row class='text-right'>
                        <Button
                            disabled={isAuthorDisabled()}
                            onClick={handleOpenConfirm}
                            variant='outline-danger'
                        >
                            Cancel Bounty
                        </Button>
                    </Row>
                </OverlayTrigger>
            </Col>
        );
    }
    const isEditorDisabled = () => {
        if (!bounty.open || bounty.review_links.length > 0) {
            return true;
        }
        else {
            return
        }
    }
    const isEditorClosedDisabled = () => {
        if (!bounty.open || bounty.review_links.length < bounty.reviewers.length) {
            return true;
        }
        else {
            return false;
        }
    }
    const editorDisabledString = () => {
        if (!bounty.open) {
            return 'Bounty is closed.';
        }
        else if (bounty.review_links.length > 0) {
            return 'Reviews have been submitted.';
        }
    }
    const editorClosedDisabledString = () => {
        if (!bounty.open) {
            return 'Bounty is closed.';
        }
        else if (bounty.review_links.length < bounty.reviewers.length) {
            return 'Reviewers are still working on their reviews.';
        }
    }
    const editorContent = () => {
        if (type !== 'editor') {
            return ('');
        }
        return (
            <>
                <Col md={{ span: 2 }}>
                    <OverlayTrigger overlay={isEditorDisabled() ? <Tooltip id="tooltip-disabled">{editorDisabledString()}</Tooltip> : <div></div>}>
                        <Row class='text-right'>
                            <Button
                                disabled={isEditorDisabled()}
                                onClick={handleShowOpenReviewer}
                                variant='outline-primary'
                            >
                                Add Reviewers
                            </Button>
                        </Row>
                    </OverlayTrigger>
                </Col>

                <Col md={{ span: 2 }}>
                    <OverlayTrigger overlay={isEditorClosedDisabled() ? <Tooltip id="tooltip-disabled">{editorClosedDisabledString()}</Tooltip> : <div></div>}>
                        <Row class='text-right' className="butt">
                            <Button
                                disabled={isEditorClosedDisabled()}
                                onClick={handleOpenConfirm}
                                variant='outline-success'
                            >
                                Close Bounty
                            </Button>
                        </Row>
                    </OverlayTrigger>
                </Col>
                <AddReviewersModal
                    showOpenForm={showOpenReviewer}
                    handleCloseOpenForm={handleCloseOpenReviewer}
                    account={account}
                    bountyid={bounty.id}
                    PRContract={PRContract}
                />
            </>
        )
    }
    // const userHasReviewed = () => {
    //     var bountyList = type === 'reviewer' ? bounties[0] : bounties;
    //     if (bountyList.length === 0 || bounties === null) {
    //         return <NoBounties type={type} />
    //     } 
    // }
    const reviewerContent = () => {
        if (type !== 'reviewer') {
            return ('');
        }
        return (
            <>
                <Col md={{ span: 2 }}>
                    <Row class='text-right'>
                        <Button
                            onClick={handleShowOpenReview}
                            variant='outline-primary'
                        >
                            Submit Review
                        </Button>
                        <SubmitReviewModal
                            showOpenForm={showOpenReview}
                            handleCloseOpenForm={handleCloseOpenReview}
                            account={account}
                            bountyid={bounty.id}
                            PRContract={PRContract}
                        />
                    </Row>
                </Col>
            </>
        )
    }

    const convertBytes32toIpfsHash = () => {
        var hashHex = "1220" + bounty.article_link.slice(2);
        var hashBytes = Buffer.from(hashHex, 'hex');
        var hashStr = bs58.encode(hashBytes);
        return hashStr;
    }
    const checkState = () => {
        if (bounty.review_links.length == 0 && !bounty.open) {
            return (
                <>
                    <span className="close">Cancelled</span>
                </>
            );
        }
        if (bounty.open) {
            return (
                <>
                    <span className="open">Open</span>
                </>
            );
        }
        if (bounty.passed) {
            return (
                <>
                    <span className="passed">Passed</span>
                </>
            );
        }
        else {
            return (
                <>
                    <span className="failed">Failed</span>
                </>
            );
        }
    }

    return (
        <div style={{ display: isVisible() ? 'block' : 'none' }}>
            <Container >
                <Card>
                    <Card.Header >Bounty {bounty.id} {checkState()}</Card.Header>
                    <Card.Body>
                        <Row className='align-items-center'>
                            <Col md={{ span: 2 }}>
                                <Row>
                                    <Col>
                                        <Card.Title>Title of Article</Card.Title>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Ratio aspectRatio="16x9">
                                            <IframeResizer
                                                src={"https://ipfs.io/ipfs/" + convertBytes32toIpfsHash()}
                                                heightCalculationMethod="lowestElement"
                                                style={{ width: '1px', minWidth: '100%' }}
                                            />
                                        </Ratio>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={{ span: 2 }}>
                                <Row>
                                    <p>Editor: {bounty.editor.substring(0, 7) + '...'}</p>
                                </Row>
                                <Row>
                                    <p>Reviewers Assigned: {bounty.reviewers.length}</p>
                                </Row>
                                <Row>
                                    <p>Reviews Submitted: {bounty.review_links.length}</p>
                                </Row>
                            </Col>
                            <Col md={{ span: 2 }}>
                                <Row>
                                    <p>Amount: {bounty.amount}</p>
                                </Row>
                                <Row>
                                    <p>Passed: {bounty.passed ? <img alt="yes passed" src={check} width="15" height="15" /> : <img alt="not passed" src={bigX} width="15" height="15" />}</p>
                                </Row>
                                <Row>
                                    <p>Open: {bounty.open ? <img alt="yes open" src={check} width="15" height="15" /> : <img alt="not open" src={bigX} width="20" height="20" />}</p>
                                </Row>
                            </Col>
                            {authorContent()}
                            {editorContent()}
                            {reviewerContent()}
                        </Row>
                    </Card.Body>
                </Card>
                <br />
                {isConfirming ? confirmModal() : ''}
            </Container>
        </div>
    );
}