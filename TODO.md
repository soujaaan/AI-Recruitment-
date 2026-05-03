# TODO - Data Contract Unification

## Completed Changes

### Backend Changes
- [x] 1. Update job controller to use salaryRange, openings, company object
- [x] 2. Update validation middleware with new field names
- [x] 3. Update updateJob handler with new field names

### Frontend Changes
- [x] 1. Update PostJob.jsx with standardized form fields
- [x] 2. Transform on submit: requirements → Array, openings → Number
- [x] 3. Use company object structure

### Data Contract
```js
{
  title,
  description,
  jobType,
  experienceLevel,
  salaryRange,
  openings,
  requirements: [],
  location,
  company: { name, website, location }
}
```

## Status: ✅ COMPLETE

Frontend and backend now use consistent field names. No more 400 errors from mismatched payloads.
