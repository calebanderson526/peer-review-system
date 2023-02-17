import React, { useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export default function WrongChain({
    account,
    disconnect,
    chainId
}) {

    const showWrongChain = () => {
        var ret = true;
        ret = ret && (account !== null && chainId !== 5);
        return ret;
    }

    return (
        <>
            <Modal
                show={showWrongChain()}
                size='lg'
                centered
            >
                <Modal.Header>
                    <Modal.Title>Looks like you aren't using the right chain!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <h5>Please switch to the goerli network</h5>
                    </Row>
                    <br />
                    <Button
                        variant="danger"
                        onClick={() => disconnect()}
                    >
                        Disconnect
                    </Button>
                </Modal.Body>
            </Modal>
        </>
    )
}