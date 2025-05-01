export const getCheckStateText = (checkStates) => {
    if (!checkStates || checkStates.length === 0)
        return "notSubmitted";
    if (checkStates.includes("修正依頼") || checkStates.includes("再修正依頼")) {
        return "request";
    } else if (checkStates.includes("再提出") || checkStates.includes("再再提出")) {
        return "reSending";
    } else if (checkStates.includes("申請中")) {
        return "sending";
    } else if (checkStates.includes("確認完了")) {
        return "check";
    } else if (checkStates.includes("承認完了")) {
        return "confirm";
    }  else if (checkStates.includes("最終確認完了")) {
        return "finalConfirm";
    } else {
        return "notSubmitted";
    }
};
