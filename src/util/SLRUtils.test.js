import { record2hash, sanitize, guessChannel, normalizers } from './SLRUtils'

test('Text normalizer test with NFC characters', () => {
  expect(normalizers.text('José¬')).toEqual('jose')
  expect(normalizers.text('Iñaki')).toEqual('inaki')
  expect(normalizers.text('Höfnerø')).toEqual('hfner')
  expect(normalizers.text('Weiß')).toEqual('wei')
  expect(normalizers.text('Cigüeña')).toEqual('ciguena')
  expect(normalizers.text('calçots')).toEqual('calcots')
  expect(normalizers.text('1234')).toEqual('')
  expect(normalizers.text('Nombre123Vía5')).toEqual('nombrevia')
  expect(normalizers.text('Nombre123Persona5')).toEqual('nombrepersona')
  expect(normalizers.text('ÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÜüÑñÇç')).toEqual('aaaaeeeeiiiioooouuuuuunncc')
  expect(normalizers.text('JAiMe,MARTÍNEZ-lóPEZ,vilÀ')).toEqual('jaimemartinezlopezvila')
  expect(normalizers.text('âéïõů')).toEqual('e')
})

test('Text normalizer test with NFD characters', () => {
  //Expected NFD characters
  expect('ÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÜüÑñÇç'.length).toEqual(52)
  expect(normalizers.text('ÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÜüÑñÇç')).toEqual('aaaaeeeeiiiioooouuuuuunncc')
  expect(normalizers.text('ÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÜüÑñÇç').length).toEqual(26)

  //Unexpected NFD characters
  expect('âéïõů'.length).toEqual(10)
  expect(normalizers.text('âéïõů')).toEqual('aeiou')
  expect(normalizers.text('âéïõů').length).toEqual(5)
})

test('Email normalizer test', () => {
  expect(normalizers.email('simpleemail@simpledomain.net')).toEqual('simpleemail@simpledomain.net')
  expect(normalizers.email('SIMPLEEMAILINMAYUS@SIMPLEDOMAININMAYUS.NET')).toEqual('simpleemailinmayus@simpledomaininmayus.net')
  expect(normalizers.email('ejemplo#mail@dominio.com')).toEqual('ejemplomail@dominio.com')
  expect(normalizers.email('ejemplo#mail-conGuion@dominio.com')).toEqual('ejemplomail-conguion@dominio.com')
  expect(normalizers.email('thISpartISCaseSensitive@mail.com')).toEqual('thispartiscasesensitive@mail.com')
  expect(normalizers.email('mail_with$symbols@mail.com')).toEqual('mail_withsymbols@mail.com')
  expect(normalizers.email('"this mail is also correct"@mail.com')).toEqual('thismailisalsocorrect@mail.com')
})

test('DNI/NIF/NIE normalizer test', () => {
  expect(normalizers.identity('12345-A')).toEqual('12345a')
  expect(normalizers.identity('1  23')).toEqual('123')
  expect(normalizers.identity('12345 A')).toEqual('12345a')
  expect(normalizers.identity('12345a ')).toEqual('12345a')
  expect(normalizers.identity(' 12 3 -')).toEqual('123')
  expect(normalizers.identity('123AB- ')).toEqual('123ab')
  expect(normalizers.identity('00GE00944876')).toEqual('00ge00944876')
  expect(normalizers.identity('12345678A')).toEqual('12345678a')
  expect(normalizers.identity('X9876543K')).toEqual('x9876543k')
  expect(normalizers.identity('-')).toEqual('')
  expect(normalizers.identity('¿\'¿')).toEqual('')
  expect(normalizers.identity('\'')).toEqual('')
  expect(normalizers.identity('()')).toEqual('')
  expect(normalizers.identity('89871368H')).toEqual('89871368h')
  expect(normalizers.identity('89871368-H')).toEqual('89871368h')
  expect(normalizers.identity('89871368|H')).toEqual('89871368h')
  expect(normalizers.identity('89871368*H')).toEqual('89871368h')
  expect(normalizers.identity('H89871368')).toEqual('h89871368')
  expect(normalizers.identity('89871368U')).toEqual('89871368')
  expect(normalizers.identity('89871368I')).toEqual('89871368')
  expect(normalizers.identity('89871368O')).toEqual('89871368')
  expect(normalizers.identity('89871368UM')).toEqual('89871368m')
  expect(normalizers.identity('89871368ÁUM')).toEqual('89871368m')

  //NFD
  expect(normalizers.identity('ÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÜüÑñÇç')).toEqual('')
  //NFC
  expect(normalizers.identity('ÁÀáàÉÈéèÍÌíìÓÒóòÚÙúùÜüÑñÇç')).toEqual('aaaaeeeenncc')

  //Some NIE specific tests
  expect(normalizers.identity('Z0117223S')).toEqual('z0117223s')
  expect(normalizers.identity('Y0106520K')).toEqual('y0106520k')
  expect(normalizers.identity('Z0117223S')).toEqual('z0117223s')
  expect(normalizers.identity('Z 0117223-S')).toEqual('z0117223s')
})

test('Portal normalizer test', () => {
  expect(normalizers.portal('15')).toEqual('15')
  expect(normalizers.portal('15b')).toEqual('15')
  expect(normalizers.portal('15 urbanización Laguna')).toEqual('15')
  expect(normalizers.portal('15-16')).toEqual('15')
  expect(normalizers.portal('15bis')).toEqual('15')
  expect(normalizers.portal('15 IZQ')).toEqual('15')
  expect(normalizers.portal('sn')).toEqual('sn')
  expect(normalizers.portal('15 1')).toEqual('15')
  expect(normalizers.portal('a15')).toEqual('')
  expect(normalizers.portal('número 23')).toEqual('')
  expect(normalizers.portal('número veintitres')).toEqual('')
  expect(normalizers.portal('-1')).toEqual('')
})

test('Phone normalizer test', () => {
  expect(normalizers.phone('0034932404070')).toEqual('0034932404070')
  expect(normalizers.phone('+34932404070')).toEqual('0034932404070')
  expect(normalizers.phone('93 240 40 70')).toEqual('0034932404070')
  expect(normalizers.phone('93-240.40.70')).toEqual('0034932404070')
  expect(normalizers.phone('932.40.40.70')).toEqual('0034932404070')
  expect(normalizers.phone('932-40.40.70.15480')).toEqual('003493240407015480')
  expect(normalizers.phone('0325256174')).toEqual('00340325256174')
  expect(normalizers.phone('+325256174')).toEqual('00325256174')
  expect(normalizers.phone('325256174')).toEqual('0034325256174')
})

test('Test channel detection for mixed input files', () => {
  // Well-formed mixed without custom field
  expect(sanitize(['DNI_NIF_NIE','00000000A'],'Mixed'))
    .toEqual({ channel: 'DNI_NIF_NIE', fields: ['00000000A']})
  expect(sanitize(['PhoneFull','Name','FirstSurname','SecondSurname','345 678 890'],'Mixed'))
    .toEqual({ channel: 'PhoneFull', fields: ['Name','FirstSurname','SecondSurname','345 678 890'] })
  expect(sanitize(['PhoneSimple','345678890'],'Mixed'))
    .toEqual({ channel: 'PhoneSimple', fields: ['345678890'] })
  expect(sanitize(['SmsFull','Name','FirstSurname','SecondSurname','345678890'],'Mixed'))
    .toEqual({ channel: 'SmsFull', fields: ['Name','FirstSurname','SecondSurname','345678890'] })
  expect(sanitize(['SmsSimple','345678890'],'Mixed'))
    .toEqual({ channel: 'SmsSimple', fields: ['345678890'] })
  expect(sanitize(['Email','regularmail@listarobinson.net'],'Mixed'))
    .toEqual({ channel: 'Email', fields: ['regularmail@listarobinson.net'] })
  expect(sanitize(['Postal','Name', 'FirstSurname', 'SecondSurname', 'MyStreet', '15', '01000', '01'],'Mixed'))
    .toEqual({ channel: 'Postal', fields: ['Name', 'FirstSurname', 'SecondSurname', 'MyStreet', '15', '01000', '01'] })

  // Well-formed with custom field
  expect(sanitize(['DNI_NIF_NIE','customField','00000000A'],'Mixed'))
    .toEqual({ channel: 'DNI_NIF_NIE', fields: ['00000000A']})
  expect(sanitize(['PhoneFull','customField','Name','FirstSurname','SecondSurname','345 678 890'],'Mixed'))
    .toEqual({ channel: 'PhoneFull', fields: ['Name','FirstSurname','SecondSurname','345 678 890'] })
  expect(sanitize(['PhoneSimple','customField','345678890'],'Mixed'))
    .toEqual({ channel: 'PhoneSimple', fields: ['345678890'] })
  expect(sanitize(['SmsFull','customField','Name','FirstSurname','SecondSurname','345678890'],'Mixed'))
    .toEqual({ channel: 'SmsFull', fields: ['Name','FirstSurname','SecondSurname','345678890'] })
  expect(sanitize(['SmsSimple','customField','345678890'],'Mixed'))
    .toEqual({ channel: 'SmsSimple', fields: ['345678890'] })
  expect(sanitize(['Email','customField','regularmail@listarobinson.net'],'Mixed'))
    .toEqual({ channel: 'Email', fields: ['regularmail@listarobinson.net'] })
  expect(sanitize(['Postal','customField','Name', 'FirstSurname', 'SecondSurname', 'MyStreet', '15', '01000', '01'],'Mixed'))
    .toEqual({ channel: 'Postal', fields: ['Name', 'FirstSurname', 'SecondSurname', 'MyStreet', '15', '01000', '01'] })

  // Malformed in mixed input
  expect(sanitize(['WrongChannelKey','Name'],'Mixed')).toEqual(null)
})

test('Test record length errors detection in single-channel input', () => {
  // Detect less fields than expected in single-channel input
  expect(sanitize(['ThisIsA','PostalRecord','With','LessFieldsThanExpected'],'Postal')).toEqual(null)
  // Detect more fields than expected in single-channel input
  expect(sanitize(['ThisIsA','SmsFullRecordWith','LessFieldsThanExpected'],'SmsFull')).toEqual(null)

  // No custom field tests needed here as custom field detection depends on well-formed records.
})

test('Test record length errors detection and fixes in mixed input', () => {
  // Detect less fields than expected in mixed input
  expect(sanitize(['Postal','LessFieldsThanExpected'],'Mixed')).toEqual(null)
  // Detect more non-empty fields than expected in mixed input
  expect(sanitize(['PhoneSimple','MoreNon-EmptyFieldsThanExpected','','a',''],'Mixed')).toEqual(null)
  // Detect and FIX more (empty) fields than expected in mixed input
  expect(sanitize(['PhoneSimple','More(Empty)FieldsThanExpected','','',''],'Mixed'))
    .toEqual({channel: 'PhoneSimple', fields: ['More(Empty)FieldsThanExpected']})

  // Detect and FIX more (empty) fields than expected in mixed input WITH custom field
  expect(sanitize(['PhoneSimple','customField','More(Empty)FieldsThanExpected','','',''],'Mixed'))
    .toEqual({channel: 'PhoneSimple', fields: ['More(Empty)FieldsThanExpected']})

  // Do not drop extra empty fields on single-channel input
  expect(sanitize(['More(Empty)FieldsThanExpected','',''],'PhoneSimple')).toEqual(null)
})

test('Test record to hash conversion with custom fields and sanitizer', () => {
  expect(record2hash(sanitize(['customField','345678890'],'PhoneSimple')))
    .toEqual('9a0d14c71b6bb4b50fd4a9efc0536de8c7198f4bebdadcc4e7ee32731fb75c15')
  expect(record2hash(sanitize(['customField','345678890'],'SmsSimple')))
    .toEqual('ea48b0f337aded1ab2d7fb495b075883b91319a0c8c5b88d5be9d28c95663ac4')

  expect(record2hash(sanitize(['customField','Name','FirstSurname','SecondSurname','345 678 890'],'PhoneFull')))
    .toEqual('64dd89690038f07b774f3283d4e492550e6b0dc64ecb3a62bb4f99b8157ab031')
  expect(record2hash(sanitize(['customField','Name','FirstSurname','SecondSurname','345678890'],'SmsFull')))
    .toEqual('e1d4f02276fd087415f9b9f8886506b30ebc8959ebe34150910036ff3149e9bd')

  expect(record2hash(sanitize(['customField','Name', 'FirstSurname', 'SecondSurname', 'MyStreet', '15', '01000', '01'],'Postal')))
    .toEqual('6c1f4252badfedb77367cefbf2fb1e4e4b00995d4b205c1fbb28c85f77fa1300')

  expect(record2hash(sanitize(['customField','regularmail@listarobinson.net'],'Email')))
    .toEqual('54c46846985b7ee2b5a1dbc899b0f55dbb711f5a7d84ab3f9f8d37060dad2174')

  //DNI
  expect(record2hash(sanitize(['customField','98765432A'],'DNI_NIF_NIE')))
    .toEqual('e524b10e0f5e00f0712ac8af272729df0b66eb7110ef1cea3ba17c582d68d28d')

  //NIE
  expect(record2hash(sanitize(['customField','X9876543A'],'DNI_NIF_NIE')))
    .toEqual('0581aca5a93de562091691b42e6f84afc7e29e8d9a3d61e4535939788221678d')
})

test('Test record to hash conversion', () => {
  expect(record2hash({fields: ['345678890'], channel: 'PhoneSimple'}))
    .toEqual('9a0d14c71b6bb4b50fd4a9efc0536de8c7198f4bebdadcc4e7ee32731fb75c15')
  expect(record2hash({fields: ['345678890'], channel: 'SmsSimple'}))
    .toEqual('ea48b0f337aded1ab2d7fb495b075883b91319a0c8c5b88d5be9d28c95663ac4')

  expect(record2hash({fields: ['Name','FirstSurname','SecondSurname','345 678 890'], channel: 'PhoneFull'}))
    .toEqual('64dd89690038f07b774f3283d4e492550e6b0dc64ecb3a62bb4f99b8157ab031')
  expect(record2hash({fields: ['Name','FirstSurname','SecondSurname','345678890'], channel: 'SmsFull'}))
    .toEqual('e1d4f02276fd087415f9b9f8886506b30ebc8959ebe34150910036ff3149e9bd')

  expect(record2hash({fields: ['Name', 'FirstSurname', 'SecondSurname', 'MyStreet', '15', '01000', '01'], channel: 'Postal'}))
    .toEqual('6c1f4252badfedb77367cefbf2fb1e4e4b00995d4b205c1fbb28c85f77fa1300')

  expect(record2hash({fields: ['regularmail@listarobinson.net'], channel: 'Email'}))
    .toEqual('54c46846985b7ee2b5a1dbc899b0f55dbb711f5a7d84ab3f9f8d37060dad2174')

  //DNI
  expect(record2hash({fields: ['98765432A'], channel: 'DNI_NIF_NIE'}))
    .toEqual('e524b10e0f5e00f0712ac8af272729df0b66eb7110ef1cea3ba17c582d68d28d')

  //NIE
  expect(record2hash({fields: ['X9876543A'], channel: 'DNI_NIF_NIE'}))
    .toEqual('0581aca5a93de562091691b42e6f84afc7e29e8d9a3d61e4535939788221678d')

  //Error handling
  expect(record2hash(null)).toEqual(null)
  expect(record2hash()).toEqual(null)
  expect(record2hash({nofields: [], channel: 'DNI_NIF_NIE'})).toEqual(null)
  expect(record2hash({fields: [], channel: 'fake_channel'})).toEqual(null)
  expect(record2hash({fields: [], noChannel: 'DNI_NIF_NIE'})).toEqual(null)
})

test('Test channel guesser', () => {
  // PhoneSimple
  expect(guessChannel(['345678890'])).toEqual('PhoneSimple')
  expect(guessChannel(['customField','345678890'])).toEqual('PhoneSimple')
  expect(guessChannel(['PhoneSimple', '345678890'])).toEqual('Mixed')
  expect(guessChannel(['PhoneSimple', 'customField','345678890'])).toEqual('Mixed')

  // PhoneFull
  expect(guessChannel(['Name','FirstSurname','SecondSurname','345 678 890'])).toEqual('PhoneFull')
  expect(guessChannel(['customField','Name','FirstSurname','SecondSurname','345 678 890'])).toEqual('PhoneFull')
  expect(guessChannel(['PhoneFull', 'Name','FirstSurname','SecondSurname','345 678 890'])).toEqual('Mixed')
  expect(guessChannel(['PhoneFull', 'customField','Name','FirstSurname','SecondSurname','345 678 890'])).toEqual('Mixed')

  // Postal
  expect(guessChannel(['Name', 'FirstSurname', 'SecondSurname', 'MyStreet', '15', '01000', '01'])).toEqual('Postal')
  expect(guessChannel(['customField','Name', 'FirstSurname', 'SecondSurname', 'MyStreet', '15', '01000', '01'])).toEqual('Postal')
  expect(guessChannel(['Postal', 'Name', 'FirstSurname', 'SecondSurname', 'MyStreet', '15', '01000', '01'])).toEqual('Mixed')
  expect(guessChannel(['Postal', 'customField','Name', 'FirstSurname', 'SecondSurname', 'MyStreet', '15', '01000', '01'])).toEqual('Mixed')

  // Email
  expect(guessChannel(['regularmail@listarobinson.net'])).toEqual('Email')
  expect(guessChannel(['customField','regularmail@listarobinson.net'])).toEqual('Email')
  expect(guessChannel(['Email', 'regularmail@listarobinson.net'])).toEqual('Mixed')
  expect(guessChannel(['Email', 'customField','regularmail@listarobinson.net'])).toEqual('Mixed')

  //DNI/NIF
  expect(guessChannel(['98765432A'])).toEqual('DNI_NIF_NIE')
  expect(guessChannel(['customField','98765432A'])).toEqual('DNI_NIF_NIE')
  expect(guessChannel(['DNI_NIF_NIE', '98765432A'])).toEqual('Mixed')
  expect(guessChannel(['DNI_NIF_NIE', 'customField','98765432A'])).toEqual('Mixed')
  //NIE
  expect(guessChannel(['X9876543A'])).toEqual('DNI_NIF_NIE')
  expect(guessChannel(['customField','X9876543A'])).toEqual('DNI_NIF_NIE')
  expect(guessChannel(['DNI_NIF_NIE', 'X9876543A'])).toEqual('Mixed')
  expect(guessChannel(['DNI_NIF_NIE', 'customField','X9876543A'])).toEqual('Mixed')
})
