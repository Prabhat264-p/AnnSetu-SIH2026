/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Location Master Data sourced from Government of India Local Government Directory (LGD)
 */

export type LocationCategory = 'STATE' | 'UNION_TERRITORY';

export interface StateUT {
  code: string;
  name: string;
  type: LocationCategory;
}

export interface DistrictData {
  code: string;
  name: string;
  stateName: string;
  blocks: string[];
}

export const INDIA_STATES: StateUT[] = [
  { code: 'AP', name: 'Andhra Pradesh', type: 'STATE' },
  { code: 'AR', name: 'Arunachal Pradesh', type: 'STATE' },
  { code: 'AS', name: 'Assam', type: 'STATE' },
  { code: 'BR', name: 'Bihar', type: 'STATE' },
  { code: 'CG', name: 'Chhattisgarh', type: 'STATE' },
  { code: 'GA', name: 'Goa', type: 'STATE' },
  { code: 'GJ', name: 'Gujarat', type: 'STATE' },
  { code: 'HR', name: 'Haryana', type: 'STATE' },
  { code: 'HP', name: 'Himachal Pradesh', type: 'STATE' },
  { code: 'JH', name: 'Jharkhand', type: 'STATE' },
  { code: 'KA', name: 'Karnataka', type: 'STATE' },
  { code: 'KL', name: 'Kerala', type: 'STATE' },
  { code: 'MP', name: 'Madhya Pradesh', type: 'STATE' },
  { code: 'MH', name: 'Maharashtra', type: 'STATE' },
  { code: 'MN', name: 'Manipur', type: 'STATE' },
  { code: 'ML', name: 'Meghalaya', type: 'STATE' },
  { code: 'MZ', name: 'Mizoram', type: 'STATE' },
  { code: 'NL', name: 'Nagaland', type: 'STATE' },
  { code: 'OD', name: 'Odisha', type: 'STATE' },
  { code: 'PB', name: 'Punjab', type: 'STATE' },
  { code: 'RJ', name: 'Rajasthan', type: 'STATE' },
  { code: 'SK', name: 'Sikkim', type: 'STATE' },
  { code: 'TN', name: 'Tamil Nadu', type: 'STATE' },
  { code: 'TS', name: 'Telangana', type: 'STATE' },
  { code: 'TR', name: 'Tripura', type: 'STATE' },
  { code: 'UP', name: 'Uttar Pradesh', type: 'STATE' },
  { code: 'UK', name: 'Uttarakhand', type: 'STATE' },
  { code: 'WB', name: 'West Bengal', type: 'STATE' },
];

export const INDIA_UNION_TERRITORIES: StateUT[] = [
  { code: 'AN', name: 'Andaman and Nicobar Islands', type: 'UNION_TERRITORY' },
  { code: 'CH', name: 'Chandigarh', type: 'UNION_TERRITORY' },
  { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'UNION_TERRITORY' },
  { code: 'DL', name: 'Delhi', type: 'UNION_TERRITORY' },
  { code: 'JK', name: 'Jammu and Kashmir', type: 'UNION_TERRITORY' },
  { code: 'LA', name: 'Ladakh', type: 'UNION_TERRITORY' },
  { code: 'LD', name: 'Lakshadweep', type: 'UNION_TERRITORY' },
  { code: 'PY', name: 'Puducherry', type: 'UNION_TERRITORY' },
];

export const INDIA_STATES_UTS: StateUT[] = [
  ...INDIA_STATES,
  ...INDIA_UNION_TERRITORIES,
];

export const DISTRICTS_MASTER: Record<string, DistrictData[]> = {
  Maharashtra: [
    { code: 'MH_NSK', name: 'Nashik', stateName: 'Maharashtra', blocks: ['Sinnar', 'Niphad', 'Dindori', 'Nashik', 'Yeola', 'Malegaon', 'Igatpuri', 'Trimbakeshwar', 'Chandwad'] },
    { code: 'MH_PUN', name: 'Pune', stateName: 'Maharashtra', blocks: ['Baramati', 'Haveli', 'Shirur', 'Indapur', 'Daund', 'Junner', 'Khed'] },
    { code: 'MH_AHM', name: 'Ahilyanagar (Ahmednagar)', stateName: 'Maharashtra', blocks: ['Rahuri', 'Kopargaon', 'Sangamner', 'Shrirampur', 'Shevgaon'] },
    { code: 'MH_NAG', name: 'Nagpur', stateName: 'Maharashtra', blocks: ['Kamptee', 'Katol', 'Ramtek', 'Saoner', 'Umred'] },
    { code: 'MH_AUR', name: 'Chhatrapati Sambhajinagar (Aurangabad)', stateName: 'Maharashtra', blocks: ['Paithan', 'Gangapur', 'Kannad', 'Sillod', 'Vaijapur'] },
  ],
  Punjab: [
    { code: 'PB_LDH', name: 'Ludhiana', stateName: 'Punjab', blocks: ['Ludhiana West', 'Jagraon', 'Samrala', 'Khanna', 'Payal'] },
    { code: 'PB_ASR', name: 'Amritsar', stateName: 'Punjab', blocks: ['Ajnala', 'Attari', 'Jandiala', 'Majitha'] },
    { code: 'PB_PTA', name: 'Patiala', stateName: 'Punjab', blocks: ['Nabha', 'Rajpura', 'Samana', 'Patiala'] },
    { code: 'PB_JAL', name: 'Jalandhar', stateName: 'Punjab', blocks: ['Nakodar', 'Phillaur', 'Shahkot', 'Jalandhar West'] },
  ],
  Haryana: [
    { code: 'HR_KNL', name: 'Karnal', stateName: 'Haryana', blocks: ['Assandh', 'Gharaunda', 'Indri', 'Nilokheri', 'Karnal'] },
    { code: 'HR_AMB', name: 'Ambala', stateName: 'Haryana', blocks: ['Barara', 'Naraingarh', 'Saha', 'Ambala'] },
    { code: 'HR_HSR', name: 'Hisar', stateName: 'Haryana', blocks: ['Adampur', 'Hansi', 'Barwala', 'Hisar'] },
  ],
  'Madhya Pradesh': [
    { code: 'MP_IDR', name: 'Indore', stateName: 'Madhya Pradesh', blocks: ['Depalpur', 'Mhow', 'Sanwer', 'Indore'] },
    { code: 'MP_UJN', name: 'Ujjain', stateName: 'Madhya Pradesh', blocks: ['Badnagar', 'Khachrod', 'Nagda', 'Tarana', 'Ujjain'] },
    { code: 'MP_BPL', name: 'Bhopal', stateName: 'Madhya Pradesh', blocks: ['Berasia', 'Fanda', 'Bhopal'] },
  ],
  'Uttar Pradesh': [
    { code: 'UP_LKO', name: 'Lucknow', stateName: 'Uttar Pradesh', blocks: ['Bakshi Ka Talab', 'Malihabad', 'Mohanlalganj', 'Sarojininagar'] },
    { code: 'UP_AGR', name: 'Agra', stateName: 'Uttar Pradesh', blocks: ['Bichpuri', 'Fatehabad', 'Kheragarh', 'Etmadpur'] },
    { code: 'UP_VNS', name: 'Varanasi', stateName: 'Uttar Pradesh', blocks: ['Araziline', 'Baragaon', 'Cholapur', 'Pindra'] },
  ],
  Rajasthan: [
    { code: 'RJ_JAI', name: 'Jaipur', stateName: 'Rajasthan', blocks: ['Amber', 'Chamu', 'Kotputli', 'Sanganer'] },
    { code: 'RJ_JOD', name: 'Jodhpur', stateName: 'Rajasthan', blocks: ['Bhopalgarh', 'Luni', 'Osian', 'Phalodi'] },
  ],
  Gujarat: [
    { code: 'GJ_AMD', name: 'Ahmedabad', stateName: 'Gujarat', blocks: ['Daskroi', 'Dholka', 'Sanand', 'Viramgam'] },
    { code: 'GJ_RJT', name: 'Rajkot', stateName: 'Gujarat', blocks: ['Gondal', 'Jasdan', 'Jetpur', 'Morbi'] },
  ],
  Karnataka: [
    { code: 'KA_BLR', name: 'Bengaluru Urban', stateName: 'Karnataka', blocks: ['Anekal', 'Bengaluru North', 'Bengaluru South'] },
    { code: 'KA_MYS', name: 'Mysuru', stateName: 'Karnataka', blocks: ['Hunsur', 'Nanjangud', 'Periyapatna', 'T.Narasipura'] },
  ],
  'Tamil Nadu': [
    { code: 'TN_CHE', name: 'Chennai', stateName: 'Tamil Nadu', blocks: ['Ayanavaram', 'Guindy', 'Mambalam', 'Velachery'] },
    { code: 'TN_CBE', name: 'Coimbatore', stateName: 'Tamil Nadu', blocks: ['Anaimalai', 'Pollachi', 'Sulur', 'Valparai'] },
  ],
  'West Bengal': [
    { code: 'WB_KOL', name: 'Kolkata', stateName: 'West Bengal', blocks: ['Alipore', 'Bhowanipore', 'Cossipore', 'Tollygunge', 'Chowringhee', 'Entally'] },
    { code: 'WB_PUR', name: 'Purba Bardhaman', stateName: 'West Bengal', blocks: ['Bhatar', 'Kalna', 'Katwa', 'Memari', 'Bardhaman I', 'Bardhaman II'] },
    { code: 'WB_PAS', name: 'Paschim Bardhaman', stateName: 'West Bengal', blocks: ['Asansol', 'Durgapur', 'Kanksa', 'Andal', 'Raniganj'] },
    { code: 'WB_N24', name: 'North 24 Parganas', stateName: 'West Bengal', blocks: ['Barasat', 'Barrackpore', 'Basirhat', 'Bongaon', 'Hasnabad'] },
    { code: 'WB_S24', name: 'South 24 Parganas', stateName: 'West Bengal', blocks: ['Baruipur', 'Canning', 'Diamond Harbour', 'Kakdwip', 'Sonarpur'] },
    { code: 'WB_HOW', name: 'Howrah', stateName: 'West Bengal', blocks: ['Amta', 'Bagnan', 'Domjur', 'Uluberia', 'Shyampur'] },
    { code: 'WB_HOG', name: 'Hooghly', stateName: 'West Bengal', blocks: ['Chinsurah', 'Chandannagar', 'Arambagh', 'Singur', 'Tarakeswar'] },
    { code: 'WB_MUR', name: 'Murshidabad', stateName: 'West Bengal', blocks: ['Berhampore', 'Domkal', 'Kandi', 'Jangipur', 'Lalbagh'] },
    { code: 'WB_NAD', name: 'Nadia', stateName: 'West Bengal', blocks: ['Krishnanagar', 'Kalyani', 'Ranaghat', 'Tehatta', 'Nabadwip'] },
    { code: 'WB_MAL', name: 'Malda', stateName: 'West Bengal', blocks: ['English Bazar', 'Chanchal', 'Gazole', 'Kaliachak', 'Old Malda'] },
    { code: 'WB_BIR', name: 'Birbhum', stateName: 'West Bengal', blocks: ['Suri', 'Bolpur', 'Rampurhat', 'Sainthia', 'Dubrajpur'] },
    { code: 'WB_BNK', name: 'Bankura', stateName: 'West Bengal', blocks: ['Bankura I', 'Bishnupur', 'Khatra', 'Onda', 'Sonamukhi'] },
    { code: 'WB_PRL', name: 'Purulia', stateName: 'West Bengal', blocks: ['Purulia I', 'Raghunathpur', 'Balarampur', 'Jhalda', 'Manbazar'] },
    { code: 'WB_PWM', name: 'Paschim Medinipur', stateName: 'West Bengal', blocks: ['Midnapore', 'Kharagpur', 'Ghatal', 'Debra'] },
    { code: 'WB_PEM', name: 'Purba Medinipur', stateName: 'West Bengal', blocks: ['Tamluk', 'Contai', 'Haldia', 'Egra', 'Nandigram'] },
    { code: 'WB_JHR', name: 'Jhargram', stateName: 'West Bengal', blocks: ['Jhargram', 'Binpur', 'Gopiballavpur', 'Jamboni'] },
    { code: 'WB_DAR', name: 'Darjeeling', stateName: 'West Bengal', blocks: ['Darjeeling Sadar', 'Kurseong', 'Mirik', 'Siliguri'] },
    { code: 'WB_KLP', name: 'Kalimpong', stateName: 'West Bengal', blocks: ['Kalimpong I', 'Kalimpong II', 'Gorubathan'] },
    { code: 'WB_JLP', name: 'Jalpaiguri', stateName: 'West Bengal', blocks: ['Jalpaiguri Sadar', 'Dhupguri', 'Mal', 'Maynaguri'] },
    { code: 'WB_APD', name: 'Alipurduar', stateName: 'West Bengal', blocks: ['Alipurduar I', 'Alipurduar II', 'Falakata', 'Madarihat'] },
    { code: 'WB_COB', name: 'Cooch Behar', stateName: 'West Bengal', blocks: ['Cooch Behar I', 'Dinhata', 'Mathabhanga', 'Mekhliganj', 'Tufanganj'] },
    { code: 'WB_UDN', name: 'Uttar Dinajpur', stateName: 'West Bengal', blocks: ['Raiganj', 'Islampur', 'Kaliaganj', 'Karandighi'] },
    { code: 'WB_DDN', name: 'Dakshin Dinajpur', stateName: 'West Bengal', blocks: ['Balurghat', 'Gangarampur', 'Harirampur', 'Kumarganj'] },
  ],
  Telangana: [
    { code: 'TS_HYD', name: 'Hyderabad', stateName: 'Telangana', blocks: ['Charminar', 'Khairatabad', 'Secunderabad', 'Serilingampally'] },
  ],
  Bihar: [
    { code: 'BR_PAT', name: 'Patna', stateName: 'Bihar', blocks: ['Danapur', 'Fatwah', 'Masaurhi', 'Phulwari Sharif'] },
    { code: 'BR_GAY', name: 'Gaya', stateName: 'Bihar', blocks: ['Bodh Gaya', 'Dobhi', 'Fatehpur', 'Manpur'] },
  ],
  'Himachal Pradesh': [
    { code: 'HP_SML', name: 'Shimla', stateName: 'Himachal Pradesh', blocks: ['Shimla Urban', 'Rampur', 'Rohru', 'Theog'] },
    { code: 'HP_KNG', name: 'Kangra', stateName: 'Himachal Pradesh', blocks: ['Dharamshala', 'Palampur', 'Nurpur', 'Kangra Sadar'] },
  ],
  Uttarakhand: [
    { code: 'UK_DDN', name: 'Dehradun', stateName: 'Uttarakhand', blocks: ['Dehradun Sadar', 'Doiwala', 'Rishikesh', 'Vikasnagar'] },
  ],
  Chhattisgarh: [
    { code: 'CG_RPR', name: 'Raipur', stateName: 'Chhattisgarh', blocks: ['Raipur Sadar', 'Abhanpur', 'Arang', 'Tilda'] },
  ],
  Jharkhand: [
    { code: 'JH_RNC', name: 'Ranchi', stateName: 'Jharkhand', blocks: ['Ranchi Sadar', 'Kanke', 'Namkum', 'Ormannjhi'] },
  ],
  Odisha: [
    { code: 'OD_KHU', name: 'Khurda', stateName: 'Odisha', blocks: ['Bhubaneswar', 'Jatni', 'Khordha Sadar', 'Banapur'] },
  ],
  Assam: [
    { code: 'AS_KMR', name: 'Kamrup Metropolitan', stateName: 'Assam', blocks: ['Guwahati', 'Dispur', 'Sonapur'] },
  ],
  'Andhra Pradesh': [
    { code: 'AP_NTR', name: 'NTR (Vijayawada)', stateName: 'Andhra Pradesh', blocks: ['Vijayawada Urban', 'Jaggayyapeta', 'Nandigama'] },
  ],
  Kerala: [
    { code: 'KL_TVM', name: 'Thiruvananthapuram', stateName: 'Kerala', blocks: ['Trivandrum Urban', 'Neyyattinkara', 'Nedumangad', 'Attingal'] },
    { code: 'KL_PLK', name: 'Palakkad', stateName: 'Kerala', blocks: ['Chittur', 'Palakkad Sadar', 'Alathur', 'Ottapalam'] },
  ],

  // 8 Previously Missing States Master Data
  'Arunachal Pradesh': [
    { code: 'AR_ITA', name: 'Itanagar Capital Complex', stateName: 'Arunachal Pradesh', blocks: ['Itanagar', 'Naharlagun', 'Nirjuli'] },
    { code: 'AR_TWG', name: 'Tawang', stateName: 'Arunachal Pradesh', blocks: ['Tawang Sadar', 'Jang', 'Lumla'] },
  ],
  Goa: [
    { code: 'GA_NGO', name: 'North Goa', stateName: 'Goa', blocks: ['Panaji', 'Bardez (Mapusa)', 'Bicholim', 'Tiswadi', 'Pernem'] },
    { code: 'GA_SGO', name: 'South Goa', stateName: 'Goa', blocks: ['Margao', 'Salcete', 'Ponda', 'Quepem', 'Canacona'] },
  ],
  Manipur: [
    { code: 'MN_IME', name: 'Imphal East', stateName: 'Manipur', blocks: ['Porompat', 'Keirao Bitra', 'Sawombung'] },
    { code: 'MN_IMW', name: 'Imphal West', stateName: 'Manipur', blocks: ['Lamphelpat', 'Patsoi', 'Wangoi'] },
  ],
  Meghalaya: [
    { code: 'ML_EKH', name: 'East Khasi Hills', stateName: 'Meghalaya', blocks: ['Mylliem (Shillong)', 'Mawphlang', 'Cherrapunjee (Sohra)'] },
    { code: 'ML_WGH', name: 'West Garo Hills', stateName: 'Meghalaya', blocks: ['Tura', 'Rongram', 'Dadenggre'] },
  ],
  Mizoram: [
    { code: 'MZ_AIZ', name: 'Aizawl', stateName: 'Mizoram', blocks: ['Aizawl Sadar', 'Tlangnuam', 'Thingsulthliah'] },
    { code: 'MZ_LUN', name: 'Lunglei', stateName: 'Mizoram', blocks: ['Lunglei Sadar', 'Hnahthial', 'Lungsen'] },
  ],
  Nagaland: [
    { code: 'NL_KHM', name: 'Kohima', stateName: 'Nagaland', blocks: ['Kohima Sadar', 'Chiephobozou', 'Sechu Zubza'] },
    { code: 'NL_DIM', name: 'Dimapur', stateName: 'Nagaland', blocks: ['Dimapur Sadar', 'Chumoukedima', 'Medziphema'] },
  ],
  Sikkim: [
    { code: 'SK_GNT', name: 'Gangtok (East Sikkim)', stateName: 'Sikkim', blocks: ['Gangtok Sadar', 'Pakyong', 'Rongli'] },
    { code: 'SK_NAM', name: 'Namchi (South Sikkim)', stateName: 'Sikkim', blocks: ['Namchi Sadar', 'Jorethang', 'Melli'] },
  ],
  Tripura: [
    { code: 'TR_WTR', name: 'West Tripura', stateName: 'Tripura', blocks: ['Agartala Sadar', 'Dukli', 'Jirania', 'Mohanpur'] },
    { code: 'TR_GOM', name: 'Gomati', stateName: 'Tripura', blocks: ['Udaipur', 'Amarpur', 'Karbook'] },
  ],

  // Union Territories Data Master
  Delhi: [
    { code: 'DL_NDL', name: 'New Delhi', stateName: 'Delhi', blocks: ['Connaught Place', 'Chanakyapuri', 'Vasant Vihar'] },
    { code: 'DL_SDL', name: 'South Delhi', stateName: 'Delhi', blocks: ['Hauz Khas', 'Saket', 'Mehrauli'] },
    { code: 'DL_EDL', name: 'East Delhi', stateName: 'Delhi', blocks: ['Preet Vihar', 'Mayur Vihar', 'Gandhi Nagar'] },
    { code: 'DL_WDL', name: 'West Delhi', stateName: 'Delhi', blocks: ['Patel Nagar', 'Rajouri Garden', 'Punjabi Bagh'] },
    { code: 'DL_CDL', name: 'Central Delhi', stateName: 'Delhi', blocks: ['Kotwali', 'Civil Lines', 'Karol Bagh'] },
    { code: 'DL_SHD', name: 'Shahdara', stateName: 'Delhi', blocks: ['Shahdara', 'Seelampur', 'Vivek Vihar'] },
  ],
  'Jammu and Kashmir': [
    { code: 'JK_SGR', name: 'Srinagar', stateName: 'Jammu and Kashmir', blocks: ['Srinagar North', 'Srinagar South', 'Khanyar'] },
    { code: 'JK_JMU', name: 'Jammu', stateName: 'Jammu and Kashmir', blocks: ['Jammu West', 'Akhnoor', 'RS Pura', 'Bishnah'] },
    { code: 'JK_ANT', name: 'Anantnag', stateName: 'Jammu and Kashmir', blocks: ['Anantnag', 'Bijbehara', 'Pahalgam'] },
  ],
  Ladakh: [
    { code: 'LA_LEH', name: 'Leh', stateName: 'Ladakh', blocks: ['Leh Town', 'Nubra Valley', 'Khaltsi', 'Diskit'] },
    { code: 'LA_KRG', name: 'Kargil', stateName: 'Ladakh', blocks: ['Kargil Town', 'Zanskar', 'Sankoo'] },
  ],
  Chandigarh: [
    { code: 'CH_CHD', name: 'Chandigarh', stateName: 'Chandigarh', blocks: ['Chandigarh Central', 'Manimajra', 'Industrial Area'] },
  ],
  'Andaman and Nicobar Islands': [
    { code: 'AN_SAN', name: 'South Andaman', stateName: 'Andaman and Nicobar Islands', blocks: ['Port Blair', 'Ferrargunj', 'Little Andaman'] },
    { code: 'AN_NMA', name: 'North and Middle Andaman', stateName: 'Andaman and Nicobar Islands', blocks: ['Mayabunder', 'Diglipur', 'Rangat'] },
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    { code: 'DN_DMN', name: 'Daman', stateName: 'Dadra and Nagar Haveli and Daman and Diu', blocks: ['Daman Main'] },
    { code: 'DN_DIU', name: 'Diu', stateName: 'Dadra and Nagar Haveli and Daman and Diu', blocks: ['Diu Town'] },
    { code: 'DN_DNH', name: 'Dadra and Nagar Haveli', stateName: 'Dadra and Nagar Haveli and Daman and Diu', blocks: ['Silvassa', 'Khanvel'] },
  ],
  Lakshadweep: [
    { code: 'LD_KVR', name: 'Lakshadweep', stateName: 'Lakshadweep', blocks: ['Kavaratti', 'Agatti', 'Minicoy', 'Amini'] },
  ],
  Puducherry: [
    { code: 'PY_PDY', name: 'Puducherry', stateName: 'Puducherry', blocks: ['Puducherry Town', 'Oulgaret', 'Villianur'] },
    { code: 'PY_KKL', name: 'Karaikal', stateName: 'Puducherry', blocks: ['Karaikal Town', 'Tirunallar'] },
  ],
};

/**
 * Get Grouped Locations (States vs Union Territories)
 */
export const getGroupedLocations = (): { states: StateUT[]; unionTerritories: StateUT[] } => {
  return {
    states: INDIA_STATES,
    unionTerritories: INDIA_UNION_TERRITORIES,
  };
};

/**
 * Get filtered array of States or UTs
 */
export const getStates = (type?: LocationCategory): StateUT[] => {
  if (type === 'STATE') return INDIA_STATES;
  if (type === 'UNION_TERRITORY') return INDIA_UNION_TERRITORIES;
  return INDIA_STATES_UTS;
};

/**
 * Get Flat List of all 36 States & UTs in India with "All India" header
 */
export const getStatesList = (): string[] => {
  return ['All India', ...INDIA_STATES_UTS.map((s) => s.name)];
};

/**
 * Get List of Districts for a selected State/UT
 */
export const getDistrictsForState = (stateName: string): string[] => {
  if (!stateName || stateName === 'All India') {
    const allDistricts = Object.values(DISTRICTS_MASTER).flatMap((list) =>
      list.map((d) => d.name)
    );
    return ['All Districts', ...Array.from(new Set(allDistricts))];
  }

  const list = DISTRICTS_MASTER[stateName];
  if (list && list.length > 0) {
    return ['All Districts', ...list.map((d) => d.name)];
  }

  // Fallback for smaller administrative entities
  return ['All Districts', 'Central District', 'North District', 'South District'];
};

/**
 * Get List of Blocks / Tehsils / Sub-districts for a selected District
 */
export const getBlocksForDistrict = (stateName: string, districtName: string): string[] => {
  if (!districtName || districtName === 'All Districts') {
    return ['All Blocks'];
  }

  const stateDistricts = DISTRICTS_MASTER[stateName];
  if (stateDistricts) {
    const distObj = stateDistricts.find((d) => d.name.toLowerCase() === districtName.toLowerCase());
    if (distObj && distObj.blocks) {
      return ['All Blocks', ...distObj.blocks];
    }
  }

  // Fallback for sub-district blocks
  const cleanDist = districtName.replace(/\s*(Central|North|South|District)\s*/gi, '').trim() || districtName;
  return ['All Blocks', `${cleanDist} Sadar`, `${cleanDist} Rural`, `${cleanDist} Urban`].filter((b, i, self) => self.indexOf(b) === i);
};

/**
 * Data Integrity Assertions for Government of India LGD Master
 */
export const validateLocationMaster = (): {
  isValid: boolean;
  stateCount: number;
  utCount: number;
  total: number;
  errors: string[];
} => {
  const errors: string[] = [];
  const stateCount = INDIA_STATES.length;
  const utCount = INDIA_UNION_TERRITORIES.length;
  const total = INDIA_STATES_UTS.length;

  if (stateCount !== 28) errors.push(`Expected 28 States, found ${stateCount}`);
  if (utCount !== 8) errors.push(`Expected 8 Union Territories, found ${utCount}`);
  if (total !== 36) errors.push(`Expected 36 total entities, found ${total}`);

  const stateNames = new Set(INDIA_STATES.map((s) => s.name));
  const utNames = new Set(INDIA_UNION_TERRITORIES.map((ut) => ut.name));

  for (const name of utNames) {
    if (stateNames.has(name)) {
      errors.push(`Overlap detected: '${name}' appears in both STATES and UNION TERRITORIES`);
    }
  }

  return {
    isValid: errors.length === 0,
    stateCount,
    utCount,
    total,
    errors,
  };
};

/**
 * Base coordinates for States and UTs in India
 */
export const STATE_BASE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Bihar: { lat: 25.612, lng: 85.168 },
  Maharashtra: { lat: 19.8512, lng: 74.0041 },
  'Tamil Nadu': { lat: 10.998, lng: 76.966 },
  Punjab: { lat: 30.901, lng: 75.8573 },
  Haryana: { lat: 29.6857, lng: 76.9905 },
  'Madhya Pradesh': { lat: 22.7485, lng: 75.8542 },
  'Uttar Pradesh': { lat: 26.915, lng: 80.932 },
  Rajasthan: { lat: 26.812, lng: 75.765 },
  Gujarat: { lat: 22.925, lng: 72.583 },
  Karnataka: { lat: 12.283, lng: 76.662 },
  'West Bengal': { lat: 23.2324, lng: 87.8615 },
  Telangana: { lat: 17.472, lng: 78.481 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Kerala: { lat: 8.5241, lng: 76.9366 },
  Odisha: { lat: 20.2961, lng: 85.8245 },
  'Andhra Pradesh': { lat: 16.5062, lng: 80.648 },
  Assam: { lat: 26.1445, lng: 91.7362 },
  'Jammu and Kashmir': { lat: 34.0837, lng: 74.7973 },
  Ladakh: { lat: 34.1526, lng: 77.5771 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  'Arunachal Pradesh': { lat: 27.1004, lng: 93.6166 },
  Goa: { lat: 15.4909, lng: 73.8278 },
  Manipur: { lat: 24.8170, lng: 93.9368 },
  Meghalaya: { lat: 25.5788, lng: 91.8933 },
  Mizoram: { lat: 23.7271, lng: 92.7176 },
  Nagaland: { lat: 25.6751, lng: 94.1086 },
  Sikkim: { lat: 27.3389, lng: 88.6065 },
  Tripura: { lat: 23.8315, lng: 91.2868 },
};

/**
 * Base coordinates for specific districts
 */
export const DISTRICT_BASE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Purba Bardhaman': { lat: 23.2324, lng: 87.8615 },
  'Paschim Bardhaman': { lat: 23.6889, lng: 86.9661 },
  'North 24 Parganas': { lat: 22.7222, lng: 88.4806 },
  'South 24 Parganas': { lat: 22.3667, lng: 88.4333 },
  'Howrah': { lat: 22.5900, lng: 88.3100 },
  'Hooghly': { lat: 22.9000, lng: 88.3800 },
  'Murshidabad': { lat: 24.1000, lng: 88.2500 },
  'Nadia': { lat: 23.4000, lng: 88.5000 },
  'Malda': { lat: 25.0000, lng: 88.1500 },
  'Birbhum': { lat: 23.9000, lng: 87.5300 },
  'Bankura': { lat: 23.2300, lng: 87.0700 },
  'Purulia': { lat: 23.3300, lng: 86.3600 },
  'Paschim Medinipur': { lat: 22.4200, lng: 87.3200 },
  'Purba Medinipur': { lat: 21.9300, lng: 87.7700 },
  'Jhargram': { lat: 22.4500, lng: 86.9800 },
  'Darjeeling': { lat: 27.0410, lng: 88.2663 },
  'Kalimpong': { lat: 27.0600, lng: 88.4700 },
  'Jalpaiguri': { lat: 26.5200, lng: 88.7300 },
  'Alipurduar': { lat: 26.4800, lng: 89.5200 },
  'Cooch Behar': { lat: 26.3200, lng: 89.4500 },
  'Uttar Dinajpur': { lat: 25.6200, lng: 88.1200 },
  'Dakshin Dinajpur': { lat: 25.2200, lng: 88.7700 },
};

/**
 * Resolves approximate base coordinates for any administrative sub-district/block in India
 */
export function getCoordinatesForSubdistrict(
  stateName: string,
  districtName: string,
  blockName: string
): { latitude: number; longitude: number; source: 'DEMO' | 'PROFILE' } {
  const base = DISTRICT_BASE_COORDINATES[districtName] || STATE_BASE_COORDINATES[stateName] || { lat: 20.5937, lng: 78.9629 };

  // Hash block and district names deterministically to derive realistic offsets
  let hash = 0;
  const str = `${stateName}_${districtName}_${blockName}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const latOffset = ((positiveHash % 100) - 50) * 0.003;
  const lngOffset = (((positiveHash >> 3) % 100) - 50) * 0.003;

  return {
    latitude: Number((base.lat + latOffset).toFixed(4)),
    longitude: Number((base.lng + lngOffset).toFixed(4)),
    source: 'DEMO',
  };
}

/**
 * Result structure for global spoken location resolution
 */
export interface LocationResolutionResult {
  state?: string;
  stateCode?: string;
  district?: string;
  districtCode?: string;
  block?: string;
  subdistrictCode?: string;
  isAmbiguous?: boolean;
  ambiguousMatches?: Array<{ state: string; district: string; block?: string }>;
}

/**
 * Devnagari and common multilingual spoken aliases mapping to canonical LGD names
 */
const SPOKEN_LOCATION_ALIASES: Record<string, string> = {
  // Bihar
  'दानापुर': 'Danapur',
  'दानापुरमें': 'Danapur',
  'दानापुर में': 'Danapur',
  'पटना': 'Patna',
  'पटना में': 'Patna',
  'फतुहा': 'Fatwah',
  'मसौढ़ी': 'Masaurhi',
  'फूलवारी': 'Phulwari Sharif',
  'गया': 'Gaya',
  // Maharashtra
  'नाशिक': 'Nashik',
  'नासिक': 'Nashik',
  'नाशिकमध्ये': 'Nashik',
  'नाशिक में': 'Nashik',
  'नासिक में': 'Nashik',
  'सिन्नर': 'Sinnar',
  'सिन्नरमध्ये': 'Sinnar',
  'सिन्नर मध्ये': 'Sinnar',
  'सिन्नरंमध्ये': 'Sinnar',
  'सिन्नर में': 'Sinnar',
  'निफाड': 'Niphad',
  'दिंडोरी': 'Dindori',
  'येवला': 'Yeola',
  'मालेगाव': 'Malegaon',
  'इगतपुरी': 'Igatpuri',
  'त्रिंबकेश्वर': 'Trimbakeshwar',
  'पुणे': 'Pune',
  'बारामती': 'Baramati',
  'पिंपळगाव': 'Pimpalgaon',
  'अहमदनगर': 'Ahilyanagar (Ahmednagar)',
  'अहिल्यानगर': 'Ahilyanagar (Ahmednagar)',
  'नागपूर': 'Nagpur',
  'छत्रपती संभाजीनगर': 'Chhatrapati Sambhajinagar (Aurangabad)',
  'औरंगाबाद': 'Chhatrapati Sambhajinagar (Aurangabad)',
  // Goa
  'पणजी': 'Panaji',
  'पणजीत': 'Panaji',
  'पणजी में': 'Panaji',
  'panjim': 'Panaji',
  'मडगाव': 'Margao',
  'पोंडा': 'Ponda',
  // Punjab
  'लुधियाना': 'Ludhiana',
  'अमृतसर': 'Amritsar',
  'पटियाला': 'Patiala',
  'जालंधर': 'Jalandhar',
  // Haryana
  'करनाल': 'Karnal',
  'अंबाला': 'Ambala',
  'हिसार': 'Hisar',
  // MP
  'इंदौर': 'Indore',
  'उज्जैन': 'Ujjain',
  'भोपाल': 'Bhopal',
  // UP
  'लखनऊ': 'Lucknow',
  'आगरा': 'Agra',
  'वाराणसी': 'Varanasi',
  // Rajasthan
  'जयपुर': 'Jaipur',
  'जोधपुर': 'Jodhpur',
  // Gujarat
  'अहमदाबाद': 'Ahmedabad',
  'राजकोट': 'Rajkot',
  // WB
  'कोलकाता': 'Kolkata',
  'बर्दवान': 'Purba Bardhaman',
  // Karnataka
  'बेंगलुरु': 'Bengaluru Urban',
  'मैसूर': 'Mysuru',
  // AP / TS
  'हैदराबाद': 'Hyderabad',
  'विजयवाडा': 'NTR (Vijayawada)',
  // Arunachal Pradesh
  'इटानगर': 'Itanagar',
  'इटानागर': 'Itanagar',
};

/**
 * Utility helper to find parent State name for any District name in DISTRICTS_MASTER
 */
export function findStateForDistrict(districtName: string): string | undefined {
  if (!districtName || districtName === 'All Districts') return undefined;

  const lower = districtName.toLowerCase().trim();
  for (const [stateName, districts] of Object.entries(DISTRICTS_MASTER)) {
    if (districts.some((d) => d.name.toLowerCase() === lower || d.name.toLowerCase().includes(lower))) {
      return stateName;
    }
  }
  return undefined;
}

/**
 * Global Multilingual Spoken Location Resolver
 * Searches entire India LGD Location Master (States, Districts, Blocks) for spoken location inputs.
 */
export function resolveSpokenLocation(text: string): LocationResolutionResult {
  if (!text || !text.trim()) return {};

  let raw = text.trim();
  let lowerText = raw.toLowerCase();

  // 0. Strip attached Marathi/Hindi postpositions and anusvara from Devnagari words (e.g. सिन्नरंमध्ये -> सिन्नर, नाशिकमध्ये -> नाशिक)
  lowerText = lowerText
    .replace(/([\u0900-\u097F]+)(ंमध्ये|मध्ये|ात|त|में|मधे)/g, '$1')
    .replace(/[\u0902\u0901]/g, '');

  // 1. Substitute known aliases in Devnagari / transliterated speech
  for (const [alias, canonical] of Object.entries(SPOKEN_LOCATION_ALIASES)) {
    if (lowerText.includes(alias.toLowerCase())) {
      lowerText = lowerText.replace(alias.toLowerCase(), canonical.toLowerCase());
    }
  }

  // 2. Clean out common spoken postpositions and filler words
  const cleanTokens = lowerText
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .split(/\s+/)
    .filter((w) => {
      const stopWords = [
        'at', 'in', 'on', 'to', 'from', 'of', 'for', 'by', 'with', 'the', 'a', 'an',
        'me', 'mein', 'mai', 'में', 'ंमध्ये', 'मध्ये', 'के', 'का', 'की', 'को', 'near',
        'centre', 'center', 'centres', 'centers', 'yard', 'mandi', 'chahiye',
        'dikhao', 'batao', 'daikhva', 'pahiye', 'pahije', 'madhe', 'wheat', 'paddy', 'rice',
        'soybean', 'chana', 'gram', 'maize', 'mustard', 'cotton', 'गेहूं',
        'गेहू', 'गहू', 'गव्हाचे', 'गव्हाच्या', 'गव्हाचं', 'धान', 'भात', 'चावल',
        'सोयाबीन', 'चना', 'मक्का', 'सरसों', 'कपास', 'find', 'show', 'search',
        'gehun', 'gehu', 'gahun', 'gawache', 'gawach', 'gawachan', 'sub-centre',
        'procurement', 'मला', 'मुझे', 'सेंटर', 'केंद्र', 'दाखवा', 'पाहिजे', 'हवे', 'चाहिए', 'दिखाओ', 'बताओ'
      ];
      return w.length > 1 && !stopWords.includes(w);
    });

  if (cleanTokens.length === 0) return {};

  // Build candidate n-grams (3-word, 2-word, 1-word)
  const candidatePhrases: string[] = [];
  for (let len = Math.min(cleanTokens.length, 3); len >= 1; len--) {
    for (let i = 0; i <= cleanTokens.length - len; i++) {
      candidatePhrases.push(cleanTokens.slice(i, i + len).join(' '));
    }
  }

  const blockMatches: Array<{ state: string; stateCode: string; district: string; districtCode: string; block: string }> = [];
  const districtMatches: Array<{ state: string; stateCode: string; district: string; districtCode: string; block: string }> = [];
  const stateMatches: Array<{ state: string; stateCode: string; district: string; block: string }> = [];

  // Helper to lookup stateCode
  const getStateCode = (stName: string): string => {
    const obj = INDIA_STATES_UTS.find((s) => s.name.toLowerCase() === stName.toLowerCase());
    return obj ? obj.code : 'IN';
  };

  // Search candidate phrases against Location Master
  for (const phrase of candidatePhrases) {
    const normPhrase = phrase.toLowerCase().trim();

    // A. Check Block Match
    for (const [stName, distList] of Object.entries(DISTRICTS_MASTER)) {
      const stCode = getStateCode(stName);
      for (const distObj of distList) {
        if (distObj.blocks) {
          for (const blk of distObj.blocks) {
            const normBlk = blk.toLowerCase().trim();
            if (normBlk === normPhrase || (normPhrase.length >= 4 && normBlk.startsWith(normPhrase))) {
              blockMatches.push({
                state: stName,
                stateCode: stCode,
                district: distObj.name,
                districtCode: distObj.code,
                block: blk,
              });
            }
          }
        }
      }
    }

    // B. Check District Match
    for (const [stName, distList] of Object.entries(DISTRICTS_MASTER)) {
      const stCode = getStateCode(stName);
      for (const distObj of distList) {
        const normDist = distObj.name.toLowerCase().trim();
        const cleanDistName = normDist.replace(/\s*\(.*\)\s*/, '').trim();
        if (normDist === normPhrase || cleanDistName === normPhrase) {
          districtMatches.push({
            state: stName,
            stateCode: stCode,
            district: distObj.name,
            districtCode: distObj.code,
            block: 'All Blocks',
          });
        }
      }
    }

    // C. Check State / UT Match
    for (const stObj of INDIA_STATES_UTS) {
      const normSt = stObj.name.toLowerCase().trim();
      if (normSt === normPhrase) {
        stateMatches.push({
          state: stObj.name,
          stateCode: stObj.code,
          district: 'All Districts',
          block: 'All Blocks',
        });
      }
    }
  }

  // Evaluate & Disambiguate Matches

  // 1. If District matches exist and phrase matches District name directly:
  // e.g. "Nashik" -> District match Nashik taking precedence over Block Nashik
  if (districtMatches.length > 0) {
    // Deduplicate
    const uniqueDistricts = districtMatches.filter(
      (m, idx, self) =>
        idx === self.findIndex((t) => t.state === m.state && t.district === m.district)
    );

    if (uniqueDistricts.length === 1) {
      const d = uniqueDistricts[0];
      // Check if user specifically requested a distinct block inside this district
      const matchingBlock = blockMatches.find(
        (bm) => bm.district === d.district && bm.block.toLowerCase() !== d.district.toLowerCase()
      );
      if (matchingBlock) {
        return {
          state: matchingBlock.state,
          stateCode: matchingBlock.stateCode,
          district: matchingBlock.district,
          districtCode: matchingBlock.districtCode,
          block: matchingBlock.block,
          subdistrictCode: `${matchingBlock.stateCode}_${matchingBlock.districtCode}_${matchingBlock.block}`,
        };
      }

      return {
        state: d.state,
        stateCode: d.stateCode,
        district: d.district,
        districtCode: d.districtCode,
        block: 'All Blocks',
      };
    } else if (uniqueDistricts.length > 1) {
      return {
        isAmbiguous: true,
        ambiguousMatches: uniqueDistricts.map((d) => ({
          state: d.state,
          district: d.district,
          block: d.block,
        })),
      };
    }
  }

  // 2. Evaluate Block Matches (e.g. Danapur -> Patna, Bihar or Sinnar -> Nashik, Maharashtra or Panaji -> North Goa, Goa)
  if (blockMatches.length > 0) {
    const uniqueBlocks = blockMatches.filter(
      (m, idx, self) =>
        idx === self.findIndex((t) => t.state === m.state && t.district === m.district && t.block === m.block)
    );

    if (uniqueBlocks.length === 1) {
      const b = uniqueBlocks[0];
      return {
        state: b.state,
        stateCode: b.stateCode,
        district: b.district,
        districtCode: b.districtCode,
        block: b.block,
        subdistrictCode: `${b.stateCode}_${b.districtCode}_${b.block}`,
      };
    } else if (uniqueBlocks.length > 1) {
      return {
        isAmbiguous: true,
        ambiguousMatches: uniqueBlocks.map((b) => ({
          state: b.state,
          district: b.district,
          block: b.block,
        })),
      };
    }
  }

  // 3. Evaluate State Matches
  if (stateMatches.length > 0) {
    const s = stateMatches[0];
    return {
      state: s.state,
      stateCode: s.stateCode,
      district: 'All Districts',
      block: 'All Blocks',
    };
  }

  return {};
}


