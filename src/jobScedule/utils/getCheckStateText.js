export const getCheckStateText = (checkStates) => {
    if (!checkStates || checkStates.length === 0)
        return "미확인";
    if (checkStates.includes("수정요청")) {
        return "수정 요청";
    } else if (checkStates.every(state => state === "신청중" || state === "재제출" || state === "재재제출")) {
        return "제출 중";
    } else if(checkStates.every(state => state === "승인완료")){
        return "승인 완료";
    } else {
        return "미제출";
    }
};
