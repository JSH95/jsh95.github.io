import { Modal, Button } from "react-bootstrap";

const SessionWarningModal = ({ show, onExtend, onLogout }) => {
    return (
        <Modal show={show} onHide={onLogout} centered>
            <Modal.Header closeButton>
                <Modal.Title>세션 만료 안내</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>로그인 시간이 곧 만료됩니다.<br />세션을 연장하시겠습니까?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onLogout}>
                    아니오 (로그아웃)
                </Button>
                <Button variant="primary" onClick={onExtend}>
                    예 (세션 연장)
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SessionWarningModal;
