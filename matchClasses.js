const pattOfClasses = [
  {
    classes: 'schools',
    patt: /(小学|中学|大学|学校|学院|教育|职业|培训)/gi,
  },
  {
    classes: 'companies',
    patt: /(公司|集团)/gi,
  },
  {
    classes: 'hotels',
    patt: /(酒店|饭店)/gi,
  },
  {
    classes: 'govs',
    patt: /(局|委|政府|检察院|法院)/gi,
  },
  {
    classes: 'cybercafes',
    patt: /(网吧|网咖)/gi,
  },
];

const matchClasses = properties => {
  const newProp = Object.assign({}, properties);
  for (const type of pattOfClasses) {
    if (type.patt.test(properties.name)) {
      newProp.description = properties.name;
      newProp.classes = type.classes;
      break;
    }
  }
  return newProp;
};

module.exports = matchClasses;
