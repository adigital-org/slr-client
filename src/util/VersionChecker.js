export default async (url, localVersion) => {
  const ret = await fetch(url)
  const body = await ret.text()
  const reg = /<meta slrclientversion=".*">/

  const latest = body.match(reg)

  return latest ? localVersion !== latest[0].split('"')[1] : false
}



