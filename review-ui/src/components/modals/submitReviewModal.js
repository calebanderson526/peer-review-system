import { Component } from "react";
import Col from "react-bootstrap/Col";
import Row from 'react-bootstrap/Row';
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import * as IPFS from 'ipfs-http-client';
import bs58 from 'bs58'
import { Buffer } from 'buffer';
import { Identity } from "@semaphore-protocol/identity";

class SubmitReviewModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isReviewed: false,
            revertReview: null,
            review: null,
            note: null,
            math_content: null,
            important_topic: null,
            interest_level: null,
            interest_growth: null,
            technically_sound: null,
            new_work: null,
            page_count: null,
            word_count: null,
            reference_count: null,
            organization_level: null,
            evaluation_summary: null,
            suggested_references: null,
            comments: null
        }

        this.handleReview = this.handleReview.bind(this);
        this.ipfsUpload = this.ipfsUpload.bind(this);
        this.formContent = this.formContent.bind(this);
    }

    /**
     * TODO: Create the function to post the review file correctly 
     * Create helper methods as see fit
     * Consult OpenBountyModal.js for connection to IPFS
     */
    async handleReview(e) {
        e.preventDefault();
        this.setState({ isReviewed: true });
        const msg = `0x${Buffer.from(this.state.note, 'utf8').toString('hex')}`;
        const sign = await window.ethereum.request({
            method: 'personal_sign',
            params: [msg, this.props.account, 'Example password'],
        });

        var identity = new Identity(sign);
        var idArray = JSON.parse(localStorage.getItem('review-identities'));
        var obj = {
            note: this.state.note,
            date: new Date()
        }
        if (idArray === null) {
            idArray = [obj]
        } else {
            idArray.push(obj);
        }
        localStorage.setItem('review-identities', JSON.stringify(idArray));

        const results = await this.ipfsUpload(identity);
        this.props.handleCloseOpenForm();
    }

    formContent() {
        return `
            Math content: ${this.state.math_content}
            Topic Importance: ${this.state.important_topic}
            Topic Interest: ${this.state.interest_level}
            Interest Growth: ${this.state.interest_growth}
            Technically Sound: ${this.state.technically_sound}
            New Work: ${this.state.new_work}
            Page Count: ${this.state.page_count}
            Word Count: ${this.state.word_count}
            Reference Count: ${this.state.reference_count}
            Organization Level: ${this.state.organization_level}
            Evaluation Summary: ${this.state.evaluation_summary}
            Suggested References: ${this.state.suggested_references}
            Comments: ${this.state.comments}
        `;
    }

    async ipfsUpload(identity) {
        // Connect to IPFS
        const projectId = process.env.REACT_APP_IPFS_ID;
        const projectSecret = process.env.REACT_APP_IPFS_SECRET;
        const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

        const node = await IPFS.create({
            url: process.env.REACT_APP_IPFS_URL,
            headers: {
                authorization,
            },
        });
        // Send file to ipfs
        const reader = new FileReader()
        reader.onload = async (e) => {
            var text = (e.target.result)
            var text = this.formContent() + text;
            const results = await node.add(text)
            const str = Buffer.from(bs58.decode(results.path)).toString('hex')
            this.props.PRContract.methods.claimBounty(
                this.props.bountyid, '0x' + str.substring(4, str.length), identity.commitment
            ).send({ from: this.props.account })
                .on('confirmation', (receipt) => {
                    window.location.reload();
                });
        };
        reader.readAsText(this.state.review)
    }

    render() {
        return (
            <Modal
                show={this.props.showOpenForm}
                onHide={this.props.handleCloseOpenForm}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Review Submission</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => this.handleReview(e)}>
                        <Row>
                            <Form.Group as={Col}>
                                <Row className='align-items-center'>
                                    <Col md={{ span: 2 }}>
                                        <Form.Label>File:</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="file"
                                            onChange={e => this.setState({ review: e.target.files[0] })}
                                            required
                                        />
                                    </Col>
                                </Row>
                                <br />
                                <Row className='align-items-center'>
                                    <Col md={{ span: 2 }}>
                                        <Form.Label>Note:</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            onChange={e => this.setState({ note: e.target.value })}
                                            required
                                            placeholder="Unique note used to claim reputation"
                                        />
                                    </Col>
                                </Row>
                                <br />
                                <Row>
                                    <Col>
                                        <strong>Reader Interest:</strong>
                                    </Col>
                                </Row>
                                <Row className='align-items-center'>
                                    <Row>
                                        <Form.Label>Amount of math in the article</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                onChange={e => this.setState({ math_content: e.target.value })}
                                                required
                                            >
                                                <option>A lot</option>
                                                <option>Some</option>
                                                <option>Little</option>
                                                <option>None</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Row>
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label>Importance of the Topic</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                onChange={e => this.setState({ important_topic: e.target.value })}
                                                required
                                            >
                                                <option>Very important</option>
                                                <option>Important</option>
                                                <option>Somewhat Important</option>
                                                <option>Don't know</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Row>
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label>Global Interest of the Topic</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                onChange={e => this.setState({ interest_level: e.target.value })}
                                                required
                                            >
                                                <option>A lot</option>
                                                <option>Some</option>
                                                <option>Little</option>
                                                <option>Don't know</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Row>
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label>How will the interest change in the future?</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                onChange={e => this.setState({ interest_growth: e.target.value })}
                                                required
                                            >
                                                <option>Grow</option>
                                                <option>Stay the same</option>
                                                <option>Shrink</option>
                                                <option>Don't know</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Row>
                                <br />
                                <Row>
                                    <strong>Content:</strong>
                                </Row>
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label>Does the paper apply technologies correctly?</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                onChange={e => this.setState({ technically_sound: e.target.value })}
                                                required
                                            >
                                                <option>Yes</option>
                                                <option>Almost</option>
                                                <option>No</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Row>
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label>Does the paper discuss novel work?</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                onChange={e => this.setState({ new_work: e.target.value })}
                                                required
                                            >
                                                <option>Yes</option>
                                                <option>No</option>
                                                <option>Don't Know</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Row>
                                <br />
                                <Row>
                                    <strong>Format and Presentation:</strong>
                                </Row>
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label>How many pages?</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                onChange={e => this.setState({ page_count: e.target.value })}
                                                required
                                            >
                                                <option>0-5</option>
                                                <option>5-10</option>
                                                <option>10+</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Row>
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label>How many pages?</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                onChange={e => this.setState({ word_count: e.target.value })}
                                                required
                                            >
                                                <option>0-2500</option>
                                                <option>2500-5000</option>
                                                <option>5000+</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Row>
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label>How many references?</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                onChange={e => this.setState({ reference_count: e.target.value })}
                                                required
                                            >
                                                <option>0-4</option>
                                                <option>4-8</option>
                                                <option>8+</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Row>
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label>How well organized is the paper?</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                onChange={e => this.setState({ organization_level: e.target.value })}
                                                required
                                            >
                                                <option>Very well</option>
                                                <option>Sufficient</option>
                                                <option>Not well</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Row>
                                <br />
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label><strong>Evaluation Summary:</strong></Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                onChange={e => this.setState({ evaluation_summary: e.target.value })}
                                                required
                                            >
                                                <option>Excellent</option>
                                                <option>Good</option>
                                                <option>Fair</option>
                                                <option>Mediocre</option>
                                                <option>Poor</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                </Row>
                                <br />
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label><strong>Suggested References:</strong></Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                as="textarea"
                                                rows={3}
                                                onChange={e => this.setState({ suggested_references: e.target.value })}
                                            >
                                            </Form.Control>
                                        </Col>
                                    </Row>
                                </Row>
                                <br />
                                <Row className='align-items-center'>
                                    <Row md={{ span: 2 }}>
                                        <Form.Label><strong>Comments:</strong></Form.Label>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                required
                                                type="text"
                                                as="textarea"
                                                rows={5}
                                                onChange={e => this.setState({ comments: e.target.value })}
                                            >
                                            </Form.Control>
                                        </Col>
                                    </Row>
                                </Row>
                            </Form.Group>
                        </Row>
                        <br />
                        <Row className='text-center'>
                            <Col>
                                <Button
                                    size='lg'
                                    type="submit"
                                >
                                    Submit Review
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    }
}

export default SubmitReviewModal;