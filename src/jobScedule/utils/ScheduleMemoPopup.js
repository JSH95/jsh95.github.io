import React from "react";
import {Modal, Card} from "react-bootstrap";
export default function ScheduleMemoPopup({ schedule, open, onOpenChange }) {
    const memos = schedule.filter(item => item.checkMemo && item.checkMemo.trim() !== "");

    return (
        <Modal show={open} onHide={() => onOpenChange(false)} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>修正要請事項リスト</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {memos.length > 0 ? (
                        memos.map((item) => (
                            <Card key={item.key} className="mb-3">
                                <Card.Body>
                                    <div className="fw-bold">該当日 : {item.key} ({item.weekday})</div>
                                    <div className="mt-2">私有 : {item.checkMemo}</div>
                                </Card.Body>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-secondary">登録されたメモがありません。</p>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
}
