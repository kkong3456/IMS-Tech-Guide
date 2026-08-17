import { ScenarioPreset } from '../types';

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'scenario-a',
    title: 'S-CSCF 가입자 인증 실패 및 HSS/Cx 연동 장애',
    category: 'equipment',
    categoryLabel: '장비 및 아키텍처',
    badgeColor: 'blue',
    iconName: 'Server',
    summary: 'S-CSCF에서 UE 등록 시 500/403 응답 발생 및 HSS 간 Cx Diameter UAR/MAR 메시지 장애 분석',
    prompt: `현재 S-CSCF에서 특정 가입자의 VoLTE/VoNR 등록 시 가입자 인증 실패가 지속적으로 발생하고 있습니다. 
S-CSCF와 HSS 간 연동 시 체크해야 할 Cx 인터페이스(Diameter) 확인 포인트와 UAR/UAA, MAR/MAA 메시지 흐름 및 인증 벡터(AV: RAND, AUTN, XRES) 처리 절차를 기술적으로 상세히 설명해 주세요.`,
    keyPoints: [
      'Cx 인터페이스 Diameter UAR/UAA, MAR/MAA 트랜잭션 점검',
      'HSS 내 가입자 프로파일(iFC, Private/Public ID) 및 Auth Vector(AV) 매칭',
      'Diameter 결과 코드(DIAMETER_ERROR_USER_UNKNOWN 5001 등) 트러블슈팅'
    ]
  },
  {
    id: 'scenario-b',
    title: '5G SA VoNR 통화 중 끊김 VOC & EPS Fallback 분석',
    category: 'qos',
    categoryLabel: '품질 VOC & 무선',
    badgeColor: 'rose',
    iconName: 'Activity',
    summary: '5G SA 환경에서 VoNR 통화 중 호 드랍 및 EPS Fallback 실패 현상 원인 규명',
    prompt: `5G SA(Option 2) 환경에서 VoNR 음성 통화 중 특정 셀 경계 지역에서 통화 끊김 및 호 드랍 VOC가 다수 인입되었습니다. 
5G NR 커버리지 경계에서의 EPS Fallback(Handover vs Redirection) 동작 메커니즘과 5QI=1 QFI 할당 상태, gNB-eNB 간 N26 인터페이스 시그널링 체크리스트를 제시해 주세요.`,
    keyPoints: [
      '5G SA -> 4G EPS Fallback 시 Redirection vs N26 Handover 지연 비교',
      '5QI=1 (음성 미디어) 및 5QI=5 (IMS 시그널링) 전용 QoS Flow 할당 검증',
      'B1/B2 Measurement Report 임계값 및 무선 커버리지 경계 최적화'
    ]
  },
  {
    id: 'scenario-c',
    title: '특정 단말 모델 VoLTE SIP REGISTER 실패 & Wireshark 분석',
    category: 'terminal',
    categoryLabel: '단말 및 규격',
    badgeColor: 'amber',
    iconName: 'Smartphone',
    summary: '특정 칩셋/OS 단말에서 IMS 등록 불가 시 Wireshark 패킷 캡처 및 SIP 헤더 점검',
    prompt: `신규 출시된 특정 단말 모델(Snapdragon/Exynos 모뎀)이 VoLTE 망에 정상 등록(REGISTER)되지 않고 있습니다. 
Wireshark 패킷 분석을 통해 SIP REGISTER 메시지, 401 Unauthorized Challenge, Authorization 헤더(Digest AKA), P-Preferred-Identity 및 Contact 헤더를 검증하는 구체적인 절차를 안내해 주세요.`,
    keyPoints: [
      'SIP REGISTER 최초 발신 vs 401 Challenge 후 2nd REGISTER 인증 헤더 검증',
      'IPSec SA(Security Association) 포트 협상(Client/Server Port-C/Port-S)',
      '단말 USIM ISIM Applet 및 Private Identity (IMPI/IMPU) 형식 점검'
    ]
  },
  {
    id: 'scenario-d',
    title: '5G NSA vs SA 음성 비교 및 긴급전화(eCall) 슬라이싱',
    category: 'wireless',
    categoryLabel: '무선 환경',
    badgeColor: 'emerald',
    iconName: 'Radio',
    summary: '5G NSA(Option 3x)와 SA(Option 2)의 음성 경로 차이와 긴급전화 우선순위 관리',
    prompt: `5G NSA(Option 3x)와 5G SA(Option 2) 환경에서의 무선 음성 통신(VoLTE vs VoNR) 메커니즘의 근본적 차이점과, 5G SA 네트워크 슬라이싱(eMBB) 환경에서 긴급전화(eCall / 112/119)에 대한 ARP(Allocation and Retention Priority) 최우선 순위 제어 방식을 설명해 주세요.`,
    keyPoints: [
      'NSA Option 3x(EPC 코어 + VoLTE) vs SA Option 2(5GC + VoNR) 아키텍처',
      '긴급전화 전용 E-P-CSCF 및 Emergency IMS PDU 세션(5QI=1, ARP=1)',
      '4G 대비 5G에서의 eCall 호 설정 시간(1.2s 이하) 및 고신뢰도'
    ]
  },
  {
    id: 'scenario-e',
    title: 'Jitter 20ms 초과 시 패킷 손실 및 EVS 코덱 음질 저하 분석',
    category: 'qos',
    categoryLabel: '품질 VOC',
    badgeColor: 'purple',
    iconName: 'Zap',
    summary: '지터 임계값 20ms 초과에 따른 RTP 패킷 드랍 및 EVS 코덱 JBM/PLC 동작 분석',
    prompt: `무선 음성 통화 품질 측정 시 지터(Jitter)가 20ms를 초과하여 MOS 점수가 3.0 이하로 급감하고 패킷 손실(Packet Loss)이 발생하는 현상이 발생했습니다. 
음성 통화 시 지터 임계값(20ms 미만)의 기술적 배경과, EVS(Enhanced Voice Services) 코덱의 JBM(Jitter Buffer Management) 및 PLC(Packet Loss Concealment) 동작 메커니즘을 설명해 주세요.`,
    keyPoints: [
      '지터 임계값 20ms 초과 시 버퍼 오버플로우/언더플로우로 인한 패킷 폐기 원리',
      '5G VoNR의 낮은 무선 TTI 및 슬롯 구조를 통한 지터 80% 감소 메커니즘',
      'EVS-SWB 코덱의 향상된 음성 대역폭(50Hz~14kHz) 및 적응형 비트레이트 제어'
    ]
  },
  {
    id: 'scenario-f',
    title: 'MGCF 및 IM-MGW를 통한 PSTN 유선망 연동 및 ISUP 변환',
    category: 'equipment',
    categoryLabel: '장비 및 아키텍처',
    badgeColor: 'cyan',
    iconName: 'GitBranch',
    summary: 'IMS Core와 기존 유선 회선 교환망(PSTN) 간 SIP-ISUP/BICC 시그널링 및 RTP-TDM 미디어 변환',
    prompt: `VoLTE/VoNR 가입자가 일반 유선전화(PSTN/ISDN)로 발신할 때, IMS Core의 MGCF(Media Gateway Control Function)와 IM-MGW가 수행하는 SIP ↔ ISUP/BICC 시그널링 매핑과 RTP ↔ TDM(PCM-64k) 미디어 트랜스코딩 절차를 설명해 주세요.`,
    keyPoints: [
      'SIP INVITE ↔ ISUP IAM (Initial Address Message) 헤더 파라미터 매핑',
      'H.248 / MEGACO 프로토콜을 통한 MGCF의 IM-MGW 베어러 터미네이션 제어',
      'SIP 180 Ringing ↔ ISUP ACM 및 SIP 200 OK ↔ ISUP ANM 전환 흐름'
    ]
  }
];
