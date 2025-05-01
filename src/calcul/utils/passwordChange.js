import React, { useState } from "react";
import { Modal, Card, Button } from "react-bootstrap";

export default function ChangePassword({ id, open, onOpenChange }) {
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const handleChangePassword = () => {
        const onlyEngNumRegex = /^[A-Za-z0-9]+$/;
        if (!onlyEngNumRegex.test(password)) {
            alert("パスワードは英字と数字のみ使用できます。");
        } else if (password.length < 8) {
            alert("パスワードは8文字以上で入力してください。");
        } else if (password !== password2) {
            alert("パスワードが一致しません。正しく入力してください。");
        } else {
            if (window.confirm("パスワードを変更しますか？")) {
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
                <Modal.Title>パスワードの変更</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Card className="mb-3">
                    <Card.Body>
                        <div>
                            <label>新しいパスワード</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="mt-3">
                            <label>新しいパスワード確認</label>
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
                    <Button variant="primary" onClick={handleChangePassword}>変更</Button>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} className="ms-2">閉じる</Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}
