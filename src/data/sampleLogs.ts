import { SampleLog } from '../types';

export const SAMPLE_LOGS: SampleLog[] = [
  {
    id: 'log-1',
    title: 'SIP 401 Unauthorized 무한 루프 (IMS-AKA Auth Fail)',
    category: 'Equipment / Terminal',
    deviceType: 'Galaxy S24 Ultra (Snapdragon 8 Gen 3)',
    networkMode: '5G SA (Option 2)',
    description: '단말이 SIP REGISTER 전송 후 401 Challenge를 수신하였으나 2차 REGISTER 전송 시 인증 실패가 반복되는 로그',
    logText: `[2026-08-16 10:14:02.120] UE -> P-CSCF [10.244.12.1:5060]
REGISTER sip:ims.mnc008.mcc450.3gppnetwork.org SIP/2.0
Via: SIP/2.0/UDP 10.128.4.52:5060;branch=z9hG4bK-789a-01
Max-Forwards: 70
From: <sip:450081234567890@ims.mnc008.mcc450.3gppnetwork.org>;tag=ue-tag-001
To: <sip:450081234567890@ims.mnc008.mcc450.3gppnetwork.org>
Call-ID: reg-call-8849102@10.128.4.52
CSeq: 1 REGISTER
Contact: <sip:450081234567890@10.128.4.52:5060;transport=udp>;expires=3600
P-Access-Network-Info: 3GPP-NR-FDD; utran-cell-id-3gpp=45008000123401
Authorization: Digest username="450081234567890@ims.mnc008.mcc450.3gppnetwork.org", realm="ims.mnc008.mcc450.3gppnetwork.org", nonce="", uri="sip:ims.mnc008.mcc450.3gppnetwork.org", response=""
Content-Length: 0

[2026-08-16 10:14:02.185] S-CSCF -> UE [10.128.4.52:5060]
SIP/2.0 401 Unauthorized
Via: SIP/2.0/UDP 10.128.4.52:5060;branch=z9hG4bK-789a-01;received=10.128.4.52
From: <sip:450081234567890@ims.mnc008.mcc450.3gppnetwork.org>;tag=ue-tag-001
To: <sip:450081234567890@ims.mnc008.mcc450.3gppnetwork.org>;tag=scscf-tag-992
Call-ID: reg-call-8849102@10.128.4.52
CSeq: 1 REGISTER
WWW-Authenticate: Digest realm="ims.mnc008.mcc450.3gppnetwork.org", nonce="e82ab41f920c991e4b83441", algorithm=AKAv1-MD5, qop="auth", ik="a1b2c3d4", ck="e5f6a7b8"
Content-Length: 0

[2026-08-16 10:14:02.240] UE -> P-CSCF [10.244.12.1:5060]
REGISTER sip:ims.mnc008.mcc450.3gppnetwork.org SIP/2.0
CSeq: 2 REGISTER
Authorization: Digest username="450081234567890@ims.mnc008.mcc450.3gppnetwork.org", realm="ims.mnc008.mcc450.3gppnetwork.org", nonce="e82ab41f920c991e4b83441", uri="sip:ims.mnc008.mcc450.3gppnetwork.org", response="3a98c71b09ff44e", auts="77aa88bb99cc"

[2026-08-16 10:14:02.310] S-CSCF (Diameter Cx MAR Result)
<Diameter-Message code="303" Flags="R,P" App-Id="16777216">
  <Session-Id>scscf01.ims.net;172384910;001</Session-Id>
  <Result-Code>5004</Result-Code> <!-- DIAMETER_ERROR_AUTHENTICATION_REJECTED -->
  <SIP-Auth-Data-Item>
    <SIP-Authentication-Scheme>Digest-AKAv1-MD5</SIP-Authentication-Scheme>
  </SIP-Auth-Data-Item>
</Diameter-Message>
SIP/2.0 403 Forbidden`,
    expectedRootCause: '단말 USIM의 K/OPc 암호화 키와 HSS DB의 인증 벡터 불일치 또는 AUTS 동기화 실패로 인한 DIAMETER_ERROR_AUTHENTICATION_REJECTED (5004)'
  },
  {
    id: 'log-2',
    title: '5G SA VoNR 호 발신 시 EPS Fallback 실패 (488 Not Acceptable)',
    category: 'Quality VOC / 5G SA',
    deviceType: 'iPhone 15 Pro (Qualcomm X70)',
    networkMode: '5G SA (Option 2)',
    description: 'VoNR 발신 시 5QI=1 베어러 생성 거절 및 EPS Fallback N26 타임아웃으로 인한 호 절단',
    logText: `[2026-08-16 14:22:15.010] UE -> P-CSCF
INVITE sip:+821098765432@ims.mnc008.mcc450.3gppnetwork.org;user=phone SIP/2.0
Via: SIP/2.0/UDP 10.128.8.19:5060;branch=z9hG4bK-inv-01
Contact: <sip:450081112223334@10.128.8.19:5060>
Content-Type: application/sdp
m=audio 49170 RTP/AVP 108 107 100
a=rtpmap:108 EVS/16000/1
a=fmtp:108 br=9.6-24.4; bw=swb; max-red=0
a=rtpmap:107 AMR-WB/16000/1
a=sendrecv

[2026-08-16 14:22:15.050] P-CSCF -> PCF [N5 Npcf_PolicyAuthorization_Create]
Service-Info: Media-Type=AUDIO, 5QI=1, ARP-Priority=2, Flow-Description="permit inout ip from 10.128.8.19 to 10.200.1.5"

[2026-08-16 14:22:15.110] 5G Core AMF -> gNB [NGAP Initial Context Setup Request]
QoSFlowSetupRequestList:
  - QFI: 1, 5QI: 1, GBR: 48kbps, MBR: 64kbps, AllocationRetentionPriority: Level=2

[2026-08-16 14:22:15.340] gNB -> AMF [NGAP Handover Required]
Cause: RadioNetwork: Handover-Desirable-For-Radio-Reasons
Target-ID: eNB-Cell-Global-ID: 450-08-10023
Direct-Forwarding-Path-Availability: False

[2026-08-16 14:22:18.400] AMF -> gNB [NGAP Handover Preparation Failure]
Cause: CoreNetwork: N26-Interface-Timeout (MME response timed out after 3000ms)

[2026-08-16 14:22:18.450] S-CSCF -> UE
SIP/2.0 488 Not Acceptable Here
Warning: 399 ims.net "EPS Fallback Handover Execution Failed - Radio/Core Timeout"`,
    expectedRootCause: '5G gNB에서 4G eNB로의 EPS Fallback 실행 중 AMF-MME 간 N26 인터페이스 시그널링 타임아웃 발생으로 5QI=1 베어러 수립 실패 (SIP 488)'
  },
  {
    id: 'log-3',
    title: 'RTP 패킷 지터 급증 (>42ms) 및 Packet Loss (3.8%) VOC',
    category: 'Quality VOC',
    deviceType: 'Pixel 8 (Tensor G3)',
    networkMode: '4G VoLTE (LTE Cat-18)',
    description: 'VoLTE 통화 중 음성 지연 및 지직거림 VOC 발생 시 캡처된 RTCP Receiver Report 로그',
    logText: `[2026-08-16 17:05:30.500] RTCP Receiver Report (SSRC: 0x88f12a)
Fraction Lost: 38 (3.8% Packet Loss)
Cumulative Number of Packets Lost: 142
Extended Highest Sequence Number Received: 65201
Interarrival Jitter: 3410 timestamps (42.6 ms) [Threshold: <20.0 ms]
Last SR Timestamp (LSR): 0x39a1b02
Delay Since Last SR (DLSR): 0x00028000 (156 ms RTT)

[2026-08-16 17:05:30.550] eNodeB Radio Measurement Report (UE RSRP/SINR)
Serving Cell RSRP: -118 dBm [Weak Coverage Edge]
Serving Cell SINR: -2.5 dB
CQI (Channel Quality Indicator): 3
BLER (Block Error Rate): 18.2%
SPS (Semi-Persistent Scheduling): Disabled (Dynamic Scheduling fallback)
HARQ Max Retransmissions Exceeded: 12 occurrences/sec
Estimated MOS Score: 2.38 / 5.0 (Quality Grade: Poor)`,
    expectedRootCause: '셀 경계 지역(RSRP -118dBm, SINR -2.5dB)에서 무선 환경 악화로 HARQ 재전송 초과 및 Dynamic Scheduling 전환으로 지터가 42.6ms로 폭증, 단말 Jitter Buffer 언더플로우 발생'
  },
  {
    id: 'log-4',
    title: 'HSS 가입자 데이터 미등록 (Cx UAA DIAMETER_ERROR_USER_UNKNOWN)',
    category: 'Equipment',
    deviceType: 'IoT VoLTE Module (Quectel EC25)',
    networkMode: '4G VoLTE',
    description: '신규 개통 IoT 단말의 VoLTE 접속 시 HSS에서 가입자 식별자 인식 실패',
    logText: `[2026-08-16 09:30:10.010] I-CSCF -> HSS [Diameter Cx User-Authorization-Request (UAR)]
<Diameter-Header code="300" R="1" P="1" App-Id="16777216" Hop-By-Hop="0x11223344">
  <Public-Identity>sip:450089988776655@ims.mnc008.mcc450.3gppnetwork.org</Public-Identity>
  <User-Name>450089988776655@ims.mnc008.mcc450.3gppnetwork.org</User-Name>
  <Server-Name>sip:scscf02.ims.mnc008.mcc450.3gppnetwork.org</Server-Name>
  <UAR-Flags>0</UAR-Flags>
</Diameter-Header>

[2026-08-16 09:30:10.045] HSS -> I-CSCF [Diameter Cx User-Authorization-Answer (UAA)]
<Diameter-Header code="300" R="0" P="1" App-Id="16777216" Hop-By-Hop="0x11223344">
  <Result-Code>5001</Result-Code> <!-- DIAMETER_ERROR_USER_UNKNOWN -->
  <Origin-Host>hss01.ims.mnc008.mcc450.3gppnetwork.org</Origin-Host>
  <Origin-Realm>ims.mnc008.mcc450.3gppnetwork.org</Origin-Realm>
</Diameter-Header>

[2026-08-16 09:30:10.060] I-CSCF -> UE
SIP/2.0 403 Forbidden - User Not Provisioned in IMS HSS`,
    expectedRootCause: 'HSS 가입자 프로파일 데이터베이스에 해당 IMSI/IMPU가 사전 프로비저닝(Provisioning)되지 않아 Diameter Result-Code 5001(USER_UNKNOWN) 및 SIP 403 Forbidden 반환'
  }
];
