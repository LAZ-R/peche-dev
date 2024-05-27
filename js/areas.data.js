let cells = [
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16',
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16',
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16',
  'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16',
  'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15', 'E16',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16',
  'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12', 'G13', 'G14', 'G15', 'G16',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12', 'H13', 'H14', 'H15', 'H16',
  'I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9', 'I10', 'I11', 'I12', 'I13', 'I14', 'I15', 'I16',
  'J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9', 'J10', 'J11', 'J12', 'J13', 'J14', 'J15', 'J16',
  'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10', 'K11', 'K12', 'K13', 'K14', 'K15', 'K16',
  'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12', 'L13', 'L14', 'L15', 'L16',
  'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16',
  'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10', 'N11', 'N12', 'N13', 'N14', 'N15', 'N16',
  'O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8', 'O9', 'O10', 'O11', 'O12', 'O13', 'O14', 'O15', 'O16',
  'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16',
];

export const AREAS = [
  {
    id: 'france',
    img: 'france',
    spawnLine: 8,
    spawnColumn: 8,
    walkableCells: [
      'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16',
      'B1', 'B2', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16',
      'C1', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16',
      'D1', 'D8', 'D9', 'D10', 'D11', 'D12', 'D15', 'D16',
      'E1', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E15', 'E16',
      'F1', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F16',
      'G1', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12', 'G16',
      'H1', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12', 'H13', 
      'I1', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9', 'I10', 'I11', 'I12', 'I13', 'I14', 
      'J1', 'J5', 'J6', 'J7', 'J8', 'J9', 'J10', 'J11', 'J12', 'J13', 'J14',
      'K1', 'K6', 'K7', 'K8', 'K9', 'K10', 'K11', 'K12', 'K13', 'K14', 
      'L1', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12', 'L13',
      'M1', 'M16',
      'N1', 'N16',
      'O1', 'O2', 'O6', 'O7', 'O8', 'O9', 'O10', 'O11', 'O14', 'O15', 'O16',
      'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16',
    ],
    swimmableCells: [
      'B3', 'B4', 'B5', 'B6',
      'C2', 'C3', 'C4', 'C5', 'C6', 'C7',
      'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D13', 'D14',
      'E2', 'E3', 'E4', 'E5', 'E6', 'E13', 'E14',
      'F2', 'F3', 'F13', 'F14', 'F15',
      'G2', 'G3', 'G13', 'G14', 'G15',
      'H2', 'H3', 'H14', 'H15', 'H16',
      'I2', 'I3', 'I15', 'I16',
      'J2', 'J3', 'J4', 'J15', 'J16',
      'K2', 'K3', 'K4', 'K5', 'K15', 'K16',
      'L2', 'L3', 'L4', 'L5', 'L6', 'L14', 'L15', 'L16',
      'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15',
      'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10', 'N11', 'N12', 'N13', 'N14', 'N15',
      'O3', 'O4', 'O5', 'O12', 'O13'
    ],
    fishes: [
      /* https://www.peche69.fr/Liste_fiche_poisson/4529-tout-savoir-sur-les-poissons-d-eau-douce.htm?ip=2&op=fp.FIP_NOM+asc&cp=2be5d7915194da7c5fb2&mp=10 */
      {
        id: 'rutilusRutilus',
        img: 'rutilusRutilus', // à faire ------------
        commonName: 'Gardon',
        scientificName: 'Rutilus rutilus',
        minLength: 22,
        maxLength: 32,
        minMass: 250,
        maxMass: 600,
      },
      {
        id: 'gasterosteusAculeatus',
        img: 'gasterosteusAculeatus', // à faire ------------
        commonName: 'Épinoche',
        scientificName: 'Gasterosteus aculeatus',
        minLength: 4,
        maxLength: 9,
        minMass: 1,
        maxMass: 7,
      },
      {
        id: 'salmoTrutta',
        img: 'salmoTrutta',
        commonName: 'Truite commune',
        scientificName: 'Salmo trutta',
        minLength: 18,
        maxLength: 49,
        minMass: 100,
        maxMass: 3000,
      },
      {
        id: 'tincaTinca',
        img: 'tincaTinca',
        commonName: 'Tanche',
        scientificName: 'Tinca tinca',
        minLength: 27,
        maxLength: 45,
        minMass: 425,
        maxMass: 1122,
      },
      {
        id: 'percaFluviatilis',
        img: 'percaFluviatilis',
        commonName: 'Perche',
        scientificName: 'Perca fluviatilis',
        minLength: 15,
        maxLength: 50,
        minMass: 200,
        maxMass: 1982,
      },
      {
        id: 'gobioGobio',
        img: 'gobioGobio', // à faire ------------
        commonName: 'Goujon',
        scientificName: 'Gobio gobio',
        minLength: 8,
        maxLength: 21,
        minMass: 20,
        maxMass: 40,
      },
      {
        id: 'lotaLota',
        img: 'lotaLota',
        commonName: 'Lote',
        scientificName: 'Lota lota',
        minLength: 35,
        maxLength: 45,
        minMass: 350,
        maxMass: 600,
      },
    ],
  }
];