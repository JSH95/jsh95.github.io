import React, { useState } from "react";
import { Modal, Card, Button } from "react-bootstrap";

export default function ChangePassword({ id, open, onOpenChange }) {
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const handleChangePassword = () => {
        const onlyEngNumRegex = /^[A-Za-z0-9]+$/;
        if (!onlyEngNumRegex.test(password)) {
            alert("비밀번호는 영어와 숫자만 입력 가능합니다.");
        } else if (password.length < 8) {
            alert("비밀번호는 8자 이상 입력해 주세요.");
        } else if (password !== password2) {
            alert("비밀번호를 정확하게 입력해 주세요.");
        } else {
            if (window.confirm("비밀번호를 변경하시겠습니까?")) {
                window.postMessage(
                    {
                        type: "changePassword",
                        password: password,
                        id: id,
                    },
                    "*"
                );
                onOpenChange(false); // 모달 닫기
            }
        }
    };

    return (
        <Modal show={open} onHide={() => onOpenChange(false)} centered size="lg">
            <Modal.Header>
                <Modal.Title>비밀번호 변경</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Card className="mb-3">
                    <Card.Body>
                        <div>
                            <label>비밀번호</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="mt-3">
                            <label>비밀번호 확인</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                            />
                        </div>
                    </Card.Body>
                </Card>
                <div className="text-center">
                    <Button variant="primary" onClick={handleChangePassword}>변경</Button>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} className="ms-2">닫기</Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}
