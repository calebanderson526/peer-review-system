import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { generateProof } from "@semaphore-protocol/proof";
import { useState, useEffect } from 'react';
import Col from "react-bootstrap/Col";
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Web3 from 'web3';

export default function Reputation({
    PRContract,
    account
}) {

    const [reputation, setReputation] = useState(0);
    const [unclaimed, setUnclaimed] = useState([]);
    const [identities, setIdentities] = useState([]);

    useEffect(() => {
        const fetchReputation = async () => {
            if(account) {
                var ret = await PRContract.methods.addressToReputation(account).call();
                setReputation(ret);
            }
        }

        const fetchIdentities = async () => {
            var ret = await PRContract.methods.allIdentities().call();
            setIdentities(ret);
        }

        const fetchUnclaimed = () => {
            var stored = JSON.parse(localStorage.getItem("review-identities"))
            if (stored) {
                console.log('yes')
                setUnclaimed(JSON.parse(localStorage.getItem("review-identities")))
            }
        }
        fetchReputation()
        fetchUnclaimed()
        fetchIdentities()

    }, [account])

    const handleClaimReputation = async (index) => {

        const web3 = new Web3();
        const msg = `0x${Buffer.from(unclaimed[index].note, 'utf8').toString('hex')}`;    
        const sign = await window.ethereum.request({
            method: 'personal_sign',
            params: [msg, account, 'Example password'],
        });

        var id = new Identity(sign)

        const group = new Group(1);
        for (let i = 0; i < identities.length; i++) {
            group.addMember(identities[i]);
        }
        var greeting = web3.utils.asciiToHex("1");
        greeting = "0xf488f488f488f488f488f488f488f488f488f488f488f488f488f488f488f488"
        const fullProof = await generateProof(id, group, 1, greeting);

        await PRContract.methods.claimReputation(
            greeting,
            fullProof.merkleTreeRoot,
            fullProof.nullifierHash,
            fullProof.proof
        ).send({from: account})
        .on('confirmation', (receipt) => {
            var tmp = unclaimed;
            tmp.splice(index, 1);
            setUnclaimed(tmp);
            localStorage.setItem('review-identities', JSON.stringify(unclaimed));

            var claimed = JSON.parse(localStorage.getItem('claimed-identities'))
            if (claimed) {
                claimed.append(tmp);
            } else {
                claimed = [tmp];
            }
            localStorage.setItem('claimed-identities', JSON.stringify(claimed));
            window.location.reload();
        });
    }

    const reputationCard = (unclaimedRep, index) => {
        var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute:'numeric' };
        return (
            <>
                <Row style={{"margin-top": "12px"}}>
                    <Col md={{ offset: 3, span: 6 }}>
                        <Card>
                            <Card.Header>
                                <h5>{unclaimedRep.note}</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row className="justify-content-center text-center align-items-center">
                                    <Col>
                                        {'Submitted: ' + new Date(unclaimedRep.date).toLocaleDateString("en-US", options)}
                                    </Col>
                                    <Col className="justify-content-center">
                                        <Button
                                            value={index}
                                            onClick={(e) => handleClaimReputation(e.target.value)}
                                        >
                                            Claim
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </>
        )
    }
    return (
        <>
            <Row>
                <h2 style={{ "margin-top": "5px" }}>Your repuation: {reputation}</h2>
            </Row>
            {unclaimed.length !== 0 ? unclaimed.map((item, index) => reputationCard(item, index)) : 'No reputation to claim'}
        </>
    )
}