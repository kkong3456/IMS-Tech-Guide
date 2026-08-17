import { GlossaryItem } from '../types';

export const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    id: 'p-cscf',
    term: 'P-CSCF',
    fullForm: 'Proxy-Call Session Control Function',
    category: 'Core Architecture',
    specification: '3GPP TS 23.228 / TS 24.229',
    description: '단말(UE)이 IMS 망에 접속할 때 만나는 최초의 접점(First Contact Point) 프록시 서버입니다. 단말의 SIP 시그널링 메시지를 수신하여 I-CSCF 또는 S-CSCF로 포워딩합니다.',
    keyRole: 'SIP 시그널링 압축(SigComp), IPSec 보안 연계(Security Association), PCRF/PCF와 Rx/N5 인터페이스를 통한 QoS 자원 예약 및 정책 제어, 긴급호 라우팅.',
    interfaces: ['Gm (UE ↔ P-CSCF)', 'Mw (P-CSCF ↔ I/S-CSCF)', 'Rx/N5 (P-CSCF ↔ PCRF/PCF)'],
    protocols: ['SIP/SDP', 'Diameter (Rx)', 'HTTP/2 SBA (N5)'],
    practicalTip: '단말 등록 실패 시 P-CSCF에 할당된 Port-C/Port-S와 IPSec SPI(Security Parameter Index) 매칭 여부를 가장 먼저 확인하십시오.'
  },
  {
    id: 's-cscf',
    term: 'S-CSCF',
    fullForm: 'Serving-Call Session Control Function',
    category: 'Core Architecture',
    specification: '3GPP TS 23.228 / TS 29.228',
    description: 'IMS 망의 핵심 두뇌 역할을 수행하는 세션 제어 엔티티입니다. 가입자의 세션 상태(Session State)를 관리하고 서비스 로직을 트리거합니다.',
    keyRole: '가입자 등록(Registration) 제어, HSS와 Cx 인터페이스를 통한 가입자 인증(IMS-AKA), 초기 필터 기준(iFC)에 따른 AS(Application Server) 서비스 트리거, 세션 라우팅.',
    interfaces: ['Cx (S-CSCF ↔ HSS)', 'Mw (S-CSCF ↔ P/I-CSCF)', 'ISC (S-CSCF ↔ AS)', 'Mg (S-CSCF ↔ MGCF)'],
    protocols: ['SIP/SDP', 'Diameter (Cx)', 'HTTP/2 REST (5G SA SBA)'],
    practicalTip: '인증 실패 발생 시 Cx MAR/MAA 트랜잭션의 Result-Code(예: 5001 User Unknown, 5004 Auth Rejected)를 점검하세요.'
  },
  {
    id: 'i-cscf',
    term: 'I-CSCF',
    fullForm: 'Interrogating-Call Session Control Function',
    category: 'Core Architecture',
    specification: '3GPP TS 23.228',
    description: '외부 망 또는 방문지 망에서 들어오는 SIP 요청을 받아 적절한 S-CSCF를 찾아 할당(Assignment) 및 라우팅해주는 게이트웨이 엔티티입니다.',
    keyRole: 'HSS와 Cx UAR/LIR 쿼리를 통한 S-CSCF 주소 획득, 네트워크 내부 토폴로지 은폐(THIG), 도메인 인바운드 호 수신 처리.',
    interfaces: ['Cx (I-CSCF ↔ HSS)', 'Mw (I-CSCF ↔ P/S-CSCF)', 'Dx (I-CSCF ↔ SLF)'],
    protocols: ['SIP/SDP', 'Diameter (Cx/Dx)'],
    practicalTip: 'DNS ENUM / SRV 레코드 조회가 실패하면 I-CSCF로의 SIP 메시지 전달이 차단됩니다.'
  },
  {
    id: 'hss-udm',
    term: 'HSS / UDM',
    fullForm: 'Home Subscriber Server / Unified Data Management',
    category: 'Core Architecture',
    specification: '3GPP TS 29.228 / TS 29.503',
    description: 'IMS 가입자의 마스터 데이터베이스입니다. 가입자 식별자(IMPI, IMPU), 인증 벡터(AV), iFC 서비스 프로파일, 등록된 S-CSCF 이름 등을 영구 저장 및 관리합니다.',
    keyRole: 'IMS-AKA 인증 벡터(RAND, AUTN, XRES, CK, IK) 생성, 가입자 등록 상태 유지, 사용자 프로파일 다운로드(SAR/SAA).',
    interfaces: ['Cx (HSS ↔ I/S-CSCF)', 'Sh (HSS ↔ AS)', 'Nudm (UDM in 5G SBA)'],
    protocols: ['Diameter', 'HTTP/2 JSON SBA'],
    practicalTip: '단말 USIM의 K값/OPc값과 HSS의 가입자 DB 암호화 키 불일치 시 401 Challenge 후 MAC Failure/Sync Failure가 발생합니다.'
  },
  {
    id: 'mgcf-im-mgw',
    term: 'MGCF / IM-MGW',
    fullForm: 'Media Gateway Control Function / IMS-Media Gateway',
    category: 'Core Architecture',
    specification: '3GPP TS 29.163 / TS 29.332',
    description: 'IMS All-IP 망과 기존 서킷 교환망(PSTN / ISDN / 3G CS) 간의 시그널링 및 미디어 상호 연동 장비입니다.',
    keyRole: 'MGCF는 SIP ↔ ISUP/BICC 시그널링 프로토콜 변환, IM-MGW는 RTP 음성 패킷 ↔ TDM (PCM-64k) 베어러 변환 및 H.248 제어.',
    interfaces: ['Mg (MGCF ↔ S-CSCF)', 'Mj (MGCF ↔ BGCF)', 'Mn (MGCF ↔ IM-MGW)', 'Mb (IM-MGW ↔ IP/PSTN)'],
    protocols: ['SIP', 'ISUP/BICC', 'H.248 (MEGACO)', 'RTP/RTCP'],
    practicalTip: 'PSTN 발신 시 Ringback tone이 안 들리는 경우 Early Media(183 Session Progress + SDP) 협상과 IM-MGW의 Through Connection 모드를 확인하십시오.'
  },
  {
    id: 'sip-register',
    term: 'SIP REGISTER & 401 Challenge',
    fullForm: 'SIP Registration with Digest AKA Flow',
    category: 'Signaling & Protocol',
    specification: 'RFC 3261 / 3GPP TS 24.229 / TS 33.203',
    description: '단말이 IMS 망에 자신의 IP 주소와 Public Identity(IMPU)를 등록하기 위해 수행하는 2단계 인증 절차입니다.',
    keyRole: '1st REGISTER (익명) → S-CSCF 401 Unauthorized (RAND, AUTN, nonce 헤더 포함) → 단말 AKA 연산 후 2nd REGISTER (RES, response 헤더 포함) → 200 OK 수락.',
    interfaces: ['Gm (UE ↔ P-CSCF)', 'Mw (P-CSCF ↔ I/S-CSCF)'],
    protocols: ['SIP/2.0', 'Digest AKA'],
    practicalTip: 'Wireshark에서 Authorization: Digest username="IMPI", realm="ims.mnc.mcc.3gppnetwork.org" 파라미터가 정확한지 확인하십시오.'
  },
  {
    id: 'eps-fallback',
    term: 'EPS Fallback',
    fullForm: 'Evolved Packet System Fallback',
    category: '5G Evolution & SBA',
    specification: '3GPP TS 23.501 / TS 23.502',
    description: '5G SA(Option 2) 망에서 5G NR 셀이 음성 통화(VoNR)를 직접 처리하기 어렵거나 커버리지 경계에 있을 때, 음성 호 설정을 즉시 4G LTE(EPS)로 전환시키는 기술입니다.',
    keyRole: 'SIP INVITE 수신 시 5G PCF가 5QI=1 QoS Flow 요청 → gNB가 측정 보고(Measurement Report)를 바탕으로 4G eNB로 Handover 또는 Redirection(with N26/without N26) 수행.',
    interfaces: ['N26 (AMF ↔ MME)', 'Xn (gNB ↔ gNB)', 'N2 (gNB ↔ AMF)'],
    protocols: ['NGAP', 'S1-AP', 'GTP-C'],
    practicalTip: 'Redirection 방식은 호 설정 시간이 3~4초로 지연될 수 있으므로 N26 인터페이스 기반 Handover 방식이 권장됩니다.'
  },
  {
    id: 'sr-vcc',
    term: 'SR-VCC',
    fullForm: 'Single Radio Voice Call Continuity',
    category: '5G Evolution & SBA',
    specification: '3GPP TS 23.216 / TS 23.237',
    description: '4G LTE VoLTE 통화 중인 단말이 4G 커버리지를 벗어나 3G WCDMA 또는 2G GSM 회선 교환(CS) 망으로 이동할 때 통화 끊김 없이 세션을 인계하는 기술입니다.',
    keyRole: 'MME와 MSC Server 간 Sv 인터페이스를 통한 핸드오버 및 SCC AS(Service Centralization and Continuity AS)를 통한 원격 세션 업데이트.',
    interfaces: ['Sv (MME ↔ MSC Server)', 'ISC (S-CSCF ↔ SCC AS)'],
    protocols: ['GTPv2-C', 'SIP (Re-INVITE)'],
    practicalTip: '최신 5G 망에서는 3G/2G 퇴역에 따라 SR-VCC 대신 VoNR ↔ VoLTE 간 핸드오버(Inter-RAT Handover)가 주류입니다.'
  },
  {
    id: '5qi-1',
    term: '5QI = 1 & QCI = 1',
    fullForm: '5G QoS Identifier 1 / QoS Class Identifier 1 (Conversational Voice)',
    category: 'QoS & VOC',
    specification: '3GPP TS 23.501 Table 5.7.4-1',
    description: '무선 음성 통화(VoLTE/VoNR) 미디어 패킷에 부여되는 보장형 비트레이트(GBR) 최상위 품질 등급입니다.',
    keyRole: 'Resource Type: GBR, Priority Level: 20(5G)/2(4G), Packet Delay Budget: 100ms, Packet Error Rate: 10^-2. 음성 패킷을 최우선 스케줄링.',
    interfaces: ['N3 (gNB ↔ UPF)', 'S1-U (eNB ↔ SGW)'],
    protocols: ['GTP-U', 'RTP'],
    practicalTip: '음성 통화 시작 시 5QI=1 베어러가 생성되지 않으면 단말이 일반 데이터 베어러(Best Effort)로 음성을 송수신하여 극심한 지터와 끊김이 발생합니다.'
  },
  {
    id: 'evs-codec',
    term: 'EVS Codec',
    fullForm: 'Enhanced Voice Services Codec',
    category: 'QoS & VOC',
    specification: '3GPP TS 26.441 / TS 26.114',
    description: '3GPP Release 12에서 제정된 차세대 이동통신 전용 HD 음성 코덱입니다. 기존 AMR-WB 대비 획기적인 음질 개선 및 패킷 손실 내성을 제공합니다.',
    keyRole: '음향 대역폭: NB(8kHz), WB(16kHz), SWB(32kHz), FB(48kHz). 비트레이트 5.9kbps~128kbps 가변 제어. 고유의 JBM(Jitter Buffer Management) 및 특수 PLC(Packet Loss Concealment) 탑재.',
    interfaces: ['RTP Payload Format (RFC 4867 / RFC 8108)'],
    protocols: ['RTP/RTCP', 'SDP'],
    practicalTip: 'EVS-SWB 13.2kbps 및 24.4kbps는 사람의 가청 주파수를 거의 완벽히 재생하여 CD 수준의 맑은 음성을 제공합니다.'
  },
  {
    id: 'jitter-voc',
    term: 'Jitter (패킷 지터) & MOS',
    fullForm: 'Packet Delay Variation & Mean Opinion Score',
    category: 'QoS & VOC',
    specification: 'ITU-T G.107 (E-Model) / 3GPP TS 26.114',
    description: '연속된 음성 패킷의 도착 시간 간격 변동치(지터)와 사용자가 체감하는 주관적 통화 품질 점수(MOS) 지표입니다.',
    keyRole: '품질 기준: Jitter < 20ms 권장 (30ms 초과 시 버퍼 오버플로우로 패킷 드랍 발생). 5G VoNR에서는 4G 대비 지터가 약 80% 감소(VoLTE ~18ms → VoNR ~3.5ms). MOS 점수 4.0 이상이 우수 기준.',
    interfaces: ['RTCP Receiver Report (RFC 3550)'],
    protocols: ['RTCP'],
    practicalTip: 'VOC 분석 시 Jitter가 20ms 이상으로 튀면 단말 디코더가 패킷을 버려 무음 또는 지직거림이 발생하므로 eNB/gNB의 DRX/SPS 스케줄링을 점검해야 합니다.'
  },
  {
    id: 'ng-rtc',
    term: 'NG-RTC & IMS Data Channel',
    fullForm: 'Next-Generation Real-Time Communications (3GPP Rel-18)',
    category: '5G Evolution & SBA',
    specification: '3GPP TS 26.114 / TS 23.228 Rel-18',
    description: '음성/영상 통화 중에 단말 간 상호작용형 데이터(화면 공유, AR 주석, 파일 전송, 번역 자막)를 동시 전송할 수 있는 WebRTC 기반 IMS 데이터 채널 기술입니다.',
    keyRole: 'SIP 세션 내 SCTP/DTLS 데이터 채널을 개설하여 통화 중 실시간 양방향 데이터 앱 실행.',
    interfaces: ['Gm (SCTP/DTLS Data Channel)'],
    protocols: ['WebRTC DataChannel', 'SCTP', 'DTLS'],
    practicalTip: 'Rel-18 차세대 통신망에서 통화 기반 AI 번역, 인터랙티브 고객센터 구축의 핵심 기반 기술입니다.'
  }
];
