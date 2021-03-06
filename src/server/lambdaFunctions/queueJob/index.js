import moment from 'moment'
import lambdaWrapper from '../../lib/lambdaWrapper'
import { generateReference } from '../../lib/references'
import { upload } from '../../lib/s3'
import { updateRecord } from '../../lib/dynamoDb'

function uploadJson({ dirName, jobRef, jobInfo }) {
  return upload({
    key: `${dirName}/${jobRef}/jobInfo.json`,
    data: JSON.stringify(jobInfo),
    contentType: 'application/json'
  })
}

export async function handler (...opts) {
  await lambdaWrapper(opts, async event => {
    const { url, dryRun, quiet } = event
    if (!url) {
      throw new Error('Missing url')
    }
    const now = moment.utc()
    const jobRef = generateReference(now)
    const jobInfo = {
      jobRef,
      url,
      submittedDate: now.toISOString()
    }
    if (!quiet) {
      console.log('jobRef:', jobRef)
      console.log('url:', url)
    }
    if (!dryRun) {
      await uploadJson({ dirName: 'jobs', jobRef, jobInfo })
      await updateRecord({ jobRef, url })
    }
    return jobInfo
  })
}
