import React, {useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {Button, Modal} from 'react-bootstrap'; // React-Bootstrap 사용
import "../../config/index.css";
import createAxiosInstance from "../../config/api";

const ScheduleCalendar = ({ schedules }) => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const events = schedules.map((schedule) => {
        let adjustedEnd = schedule.endDateTime;

        // 종료 시간이 자정(00:00:00)이면 하루를 더하여 마지막 날까지 표시
        if (adjustedEnd.endsWith("T00:00:00") && schedule.endDateTime !== schedule.startDateTime) {
        const endDate = new Date(adjustedEnd);
        endDate.setDate(endDate.getDate() + 1); // 하루 추가
        adjustedEnd = endDate.toISOString().split(".")[0]; // ISO 형식 유지
        } else {
            adjustedEnd = schedule.endDateTime;
        }
        const eventColors = {
            면접: "#4285F4", // 파란색
            기관: "#34A853", // 초록색
            이벤트: "#EA4335", // 빨간색
            기타: "#FBBC05", // 노란색
            회계: "#9E9E9E" // 기본 회색
        };

        return{
            id: schedule.id,
            title: schedule.name,
            start: schedule.startDateTime,
            end: adjustedEnd,
            allDay: schedule.allDay === 1? true : false,
            extendedProps: {
                scheduleInfo: schedule.scheduleInfo,
                scheduleType: schedule.scheduleType,
                institutionId: schedule.institutionId,
                institutionName: schedule.institution.name,
            },
            display: 'list-item',
            backgroundColor: eventColors[schedule.scheduleType] || eventColors.default, // 🔹 색상 적용
            borderColor: eventColors[schedule.scheduleType] || eventColors.default, // 🔹 테두리 색상도 동일하게 적용
        };
    });

    const handleEventClick = (info) => {
        const eventDetails = {
            id: info.event.id,
            title: info.event.title,
            scheduleInfo: info.event.extendedProps.scheduleInfo,
            start: info.event.start ? info.event.start.toLocaleDateString() : '-',
            startTime: info.event.start
                ? info.event.start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                : '-',
            end: info.event.end ? info.event.end.toLocaleDateString() : '-',
            endTime: info.event.end
                ? info.event.end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                : '-',
            scheduleType: info.event.extendedProps.scheduleType,
            institutionId: info.event.extendedProps.institutionId,
            institutionName: info.event.extendedProps.institutionName,
        };
        setSelectedEvent(eventDetails);
        setShowModal(true); // 모달 열기
    };

    const handleCloseModal = () => setShowModal(false); // 모달 닫기

    return (
        <div>
            <div  style={{ overflowX: 'auto', marginBottom: '20px' }}>
                <div style={{ minWidth: '600px' }}>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        events={events}
                        eventClick={handleEventClick}  // 클릭 이벤트 처리기 등록
                        displayEventTime={false} // 🔹 시간 자체를 숨김
                    />
                </div>

                {/* 상세 일정 모달 */}
                {selectedEvent && (
                    <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>상세 일정</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <h2>{selectedEvent.title}</h2>
                            <p><strong>교육기관:</strong> {selectedEvent.institutionName}</p>
                            <p><strong>유형:</strong> {selectedEvent.scheduleType}</p>
                            <p><strong>일정 정보:</strong> {selectedEvent.scheduleInfo}</p>

                            {selectedEvent.start !== selectedEvent.end ? (
                                // 여러 날에 걸친 일정
                                <p><strong>기간:</strong> {selectedEvent.start} ~ {selectedEvent.end}</p>
                            ) : selectedEvent.startTime !== selectedEvent.endTime ? (
                                // 같은 날이지만 시간이 다른 경우
                                <>
                                    <p><strong>날짜:</strong> {selectedEvent.start}</p>
                                    <p><strong>시간:</strong> {selectedEvent.startTime} ~ {selectedEvent.endTime}</p>
                                </>
                            ) : (
                                // 같은 날, 시간 정보가 없거나 동일하면 종일
                                <>
                                    <p><strong>날짜:</strong> {selectedEvent.start}</p>
                                    <p><strong>시간:</strong> 종일</p>
                                </>
                            )}

                            <Button className="me-3" variant="danger" onClick={async () => {
                                if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
                                    if (window.opener) {
                                        // 부모 창이 존재할 경우 postMessage 전송
                                        window.opener.postMessage({
                                            type: 'deleteSchedule',
                                            institutionId: selectedEvent.institutionId,
                                            scheduleId: selectedEvent.id,
                                        }, '*');
                                    } else {
                                        // 부모 창이 없을 경우 직접 API 호출
                                        try {
                                            const axiosInstance = createAxiosInstance();
                                            await axiosInstance.delete(`/personnel/institution/${selectedEvent.institutionId}/schedule/${selectedEvent.id}`);
                                            alert('일정이 삭제되었습니다.');
                                            window.location.reload(); // 현재 페이지 새로고침
                                        } catch (error) {
                                            alert('삭제 실패: ' + error.message);
                                        }
                                    }
                                    handleCloseModal();
                                }
                            }}>
                                삭제
                            </Button>

                            <Button className="me-2" variant="primary" onClick={() => {
                                const editUrl = `/#/personnel/institution/${selectedEvent.institutionId}/schedule/${selectedEvent.id}`;
                                if (window.opener) {
                                    window.opener.location.href = editUrl; // 부모 창 URL 변경
                                    window.close(); // 현재 창 닫기
                                } else {
                                    window.location.href = editUrl; // 부모 창이 없으면 현재 창에서 이동
                                }
                                handleCloseModal();
                            }}>
                                수정
                            </Button>

                            <Button variant="secondary" onClick={handleCloseModal}>
                                닫기
                            </Button>
                        </Modal.Body>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default ScheduleCalendar;
