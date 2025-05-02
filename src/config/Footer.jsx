import React from "react";
import {Link} from "react-router-dom";
import {useAuth} from "./AuthContext";
import "../config/index.css";

const Footer = () => {
    const {isLoggedIn} = useAuth();
    return (
        <footer className="bg-[#222] text-gray-200 px-6 py-8"
                style={{
                    backgroundColor: "#4676ed",
                    color: "#ffffff"
        }}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
                {/* Left: Logo + Info */}
                <div className="flex items-start gap-4">
                    <div className="leading-relaxed">
                        {isLoggedIn ?
                            <div className="mb-3">
                                <Link to="https://sites.google.com/view/weavuswiki/%E7%A4%BE%E5%86%85%E6%97%A5%E7%A8%8B"
                                      rel="noopener noreferrer"
                                      target="_blank"
                                      className="btn text-white"
                                ><strong>社内WIKI</strong></Link>
                                <Link to="https://weavus.tw4.quickconnect.to/?launchApp=SYNO.Cal.Application"
                                      rel="noopener noreferrer"
                                      target="_blank"
                                      className="btn text-white"
                                ><strong>カレンダー</strong></Link>
                                <Link to="https://weavus.tw4.quickconnect.to/?launchApp=SYNO.Contacts."
                                      rel="noopener noreferrer"
                                      target="_blank"
                                      className="btn text-white"
                                ><strong>コンテックス</strong></Link>
                                <Link to="https://weavus.tw4.quickconnect.to/?launchApp=SYNO.SDS.Drive.Application"
                                      rel="noopener noreferrer"
                                      target="_blank"
                                      className="btn text-white"
                                ><strong>ファイル</strong></Link>
                            </div>
                            :null}
                        <div style={{
                            paddingLeft: "12px",
                            paddingRight: "12px",
                        }}>
                            <div className="d-flex align-items-center gap-2">
                                <strong>株式会社WEAVUS</strong>
                            </div>
                            <p>〒160-0022 東京都新宿区新宿1-19-10
                                <span className="foot-mobile-break">サンモールクレスト205号</span>
                            </p>
                            <p>TEL. 03-4363-2456　
                                <span className="foot-mobile-break">MAIL. jungsh0802@weavus-group.com</span>

                            </p>
                            <div className="text-sm text-right leading-relaxed" style={{
                                paddingBottom: "10px",
                            }}>
                                <span>Copyright © 2023 WEAVUS</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
