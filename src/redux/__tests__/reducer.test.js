import * as reducer from '../reducer'
import * as action from '../actions'

describe('environment reducer', () => {
  it('should handle SET_ENV', () => {
    expect(
      reducer.env('development', {
        type: action.SET_ENV,
        env: 'production'
      })
    ).toEqual('production')
  })
})

describe('login reducer', () => {
  it('should handle SET_LOGIN_STATE success', () => {
    expect(
      reducer.user(
        { token: null, status: null, username: null },
        {
          type: action.SET_LOGIN_STATE,
          token: 'token',
          username: 'user',
          status: 200
        }
      )
    ).toEqual({ token: 'token', status: 200, username: 'user' })
  })

  it('should handle SET_LOGIN_STATE on error', () => {
    expect(
      reducer.user(
        { token: null, status: null, username: null },
        {
          type: action.SET_LOGIN_STATE,
          token: null,
          status: 401,
          username: null
        }
      )
    ).toEqual({ token: null, status: 401, username: null })
  })

  it('should handle USER_LOGOUT', () => {
    expect(
      reducer.user(
        { token: '2525', status: 'test', username: 'test' },
        {
          type: action.USER_LOGOUT
        }
      )
    ).toEqual({
      token: null,
      username: null,
      status: null
    })
  })

  it('should reset rootReducer state on USER_LOGOUT', () => {
    expect(
      reducer.rootReducer(
        { token: '2525', status: 'test', username: 'test' },
        {
          type: action.USER_LOGOUT
        }
      )
    ).toEqual({
      drafts: [],
      env: 'production',
      families: [],
      language: false,
      snapshots: [],
      surveys: [],
      user: { status: null, token: null, username: null }
    })
  })
})

describe('surveys reducer', () => {
  const payload = {
    data: {
      surveysByUser: [
        { surveyId: 1, surveyContent: 'content' },
        { surveyId: 2, surveyContent: 'content-2' }
      ]
    }
  }
  it('should handle LOAD_SURVEYS', () => {
    expect(
      reducer.surveys([], {
        type: action.LOAD_SURVEYS,
        payload
      })
    ).toEqual(payload.data.surveysByUser)
    expect(
      reducer.surveys([], {
        type: action.LOAD_SURVEYS
      })
    ).toEqual([])
  })
})

describe('families reducer', () => {
  const payload = [
    { familyId: 1, familyContent: 'content' },
    { familyId: 2, familyContent: 'content-2' }
  ]
  it('should handle LOAD_FAMILIES', () => {
    expect(
      reducer.families([], {
        type: action.LOAD_FAMILIES,
        payload
      })
    ).toEqual(payload)
    expect(
      reducer.surveys([], {
        type: action.LOAD_FAMILIES
      })
    ).toEqual([])
  })
})

describe('snapshots reducer', () => {
  const payload = [
    { snapshotId: 1, snapshotContent: 'content' },
    { snapshotId: 2, snapshotContent: 'content-2' }
  ]
  it('should handle LOAD_SNAPSHOTS', () => {
    expect(
      reducer.snapshots([], {
        type: action.LOAD_SNAPSHOTS,
        payload
      })
    ).toEqual(payload)
    expect(
      reducer.surveys([], {
        type: action.LOAD_SNAPSHOTS
      })
    ).toEqual([])
  })
})

describe('drafts reducer', () => {
  const initialStore = [
    {
      draftId: 1,
      status: 'Synced'
    },
    {
      draftId: 2,
      status: 'In progress',
      priorities: [
        { indicator: 'phoneNumber', action: 'Action', reason: 'reason' }
      ],
      familyData: {
        familyMembersList: [
          ({ name: 'Joan', socioEconomicAnswers: [] }, { name: 'Jane' })
        ]
      }
    }
  ]
  it('should handle CREATE_DRAFT', () => {
    const payload = {
      draftId: 3
    }
    expect(
      reducer.drafts(initialStore, {
        type: action.CREATE_DRAFT,
        payload
      })
    ).toEqual([...initialStore, { ...payload, status: 'In progress' }])
  })
  it('should handle SUBMIT_DRAFT', () => {
    const expectedStore = [
      {
        draftId: 1,
        status: 'Pending sync'
      },
      {
        draftId: 2,
        status: 'In progress',
        priorities: [
          { indicator: 'phoneNumber', action: 'Action', reason: 'reason' }
        ],
        familyData: {
          familyMembersList: [({ name: 'Joan' }, { name: 'Jane' })]
        }
      }
    ]
    expect(
      reducer.drafts(initialStore, {
        type: action.SUBMIT_DRAFT,
        id: 1
      })
    ).toEqual(expectedStore)
  })
  it('should handle SUBMIT_DRAFT_COMMIT', () => {
    const expectedStore = [
      {
        draftId: 1,
        status: 'Synced'
      },
      {
        draftId: 2,
        status: 'Synced',
        priorities: [
          { indicator: 'phoneNumber', action: 'Action', reason: 'reason' }
        ],
        familyData: {
          familyMembersList: [({ name: 'Joan' }, { name: 'Jane' })]
        }
      }
    ]
    expect(
      reducer.drafts(initialStore, {
        type: action.SUBMIT_DRAFT_COMMIT,
        meta: { id: 2 }
      })
    ).toEqual(expectedStore)
  })
  it('should handle SUBMIT_DRAFT_ROLLBACK', () => {
    const expectedStore = [
      {
        draftId: 1,
        status: 'Synced'
      },
      {
        draftId: 2,
        status: 'Sync error',
        priorities: [
          { indicator: 'phoneNumber', action: 'Action', reason: 'reason' }
        ],
        familyData: {
          familyMembersList: [({ name: 'Joan' }, { name: 'Jane' })]
        }
      }
    ]
    expect(
      reducer.drafts(initialStore, {
        type: action.SUBMIT_DRAFT_ROLLBACK,
        meta: { id: 2 }
      })
    ).toEqual(expectedStore)
  })
  it('should handle ADD_SURVEY_DATA', () => {
    const expectedStore = [
      {
        draftId: 1,
        status: 'Synced'
      },
      {
        draftId: 2,
        personal_survey_data: { name: 'Name' },
        status: 'In progress',
        priorities: [
          { indicator: 'phoneNumber', action: 'Action', reason: 'reason' }
        ],
        familyData: {
          familyMembersList: [({ name: 'Joan' }, { name: 'Jane' })]
        }
      }
    ]
    expect(
      reducer.drafts(initialStore, {
        type: action.ADD_SURVEY_DATA,
        id: 2,
        category: 'personal_survey_data',
        payload: { name: 'Name' }
      })
    ).toEqual(expectedStore)
  })
  it('should handle REMOVE_FAMILY_MEMBERS', () => {
    const expectedStore = [
      {
        draftId: 1,
        status: 'Synced'
      },
      {
        draftId: 2,
        status: 'In progress',
        priorities: [
          { indicator: 'phoneNumber', action: 'Action', reason: 'reason' }
        ],
        familyData: {
          familyMembersList: [{ name: 'Jane' }]
        }
      }
    ]
    expect(
      reducer.drafts(initialStore, {
        type: action.REMOVE_FAMILY_MEMBERS,
        id: 2,
        afterIndex: 1
      })
    ).toEqual(expectedStore)
  })
  it('should handle ADD_SURVEY_PRIORITY_ACHEIVEMENT_DATA', () => {
    const expectedStore = [
      {
        draftId: 1,
        status: 'Synced'
      },
      {
        draftId: 2,
        status: 'In progress',
        priorities: [
          { indicator: 'phoneNumber', action: 'Action', reason: 'reason' },
          { indicator: 'Income', action: 'Some action' }
        ],
        familyData: {
          familyMembersList: [({ name: 'Joan' }, { name: 'Jane' })]
        }
      }
    ]
    expect(
      reducer.drafts(initialStore, {
        type: action.ADD_SURVEY_PRIORITY_ACHEIVEMENT_DATA,
        id: 2,
        category: 'priorities',
        payload: { indicator: 'Income', action: 'Some action' }
      })
    ).toEqual(expectedStore)
  })
  it('should update existing priority via ADD_SURVEY_PRIORITY_ACHEIVEMENT_DATA', () => {
    const expectedStore = [
      {
        draftId: 1,
        status: 'Synced'
      },
      {
        draftId: 2,
        status: 'In progress',
        priorities: [
          {
            indicator: 'phoneNumber',
            action: 'Changed action',
            reason: 'Changed reason'
          }
        ],
        familyData: {
          familyMembersList: [({ name: 'Joan' }, { name: 'Jane' })]
        }
      }
    ]
    expect(
      reducer.drafts(initialStore, {
        type: action.ADD_SURVEY_PRIORITY_ACHEIVEMENT_DATA,
        id: 2,
        category: 'priorities',
        payload: {
          indicator: 'phoneNumber',
          action: 'Changed action',
          reason: 'Changed reason'
        }
      })
    ).toEqual(expectedStore)
  })
  it('should handle ADD_SURVEY_FAMILY_MEMBER_DATA when adding data to an existing family member', () => {
    let expectedStore = [
      { draftId: 1, status: 'Synced' },
      {
        draftId: 2,
        familyData: { familyMembersList: [{ name: 'Jane' }, { gender: 'F' }] },
        priorities: [
          { action: 'Action', indicator: 'phoneNumber', reason: 'reason' }
        ],
        status: 'In progress'
      }
    ]

    expect(
      reducer.drafts(initialStore, {
        type: action.ADD_SURVEY_FAMILY_MEMBER_DATA,
        id: 2,
        index: 2,
        isSocioEconomicAnswer: false,
        payload: {
          gender: 'F'
        }
      })
    ).toEqual(expectedStore)
  })

  it('should handle ADD_SURVEY_FAMILY_MEMBER_DATA when adding data to a new family member', () => {
    const expectedStore = [
      { draftId: 1, status: 'Synced' },
      {
        draftId: 2,
        familyData: {
          familyMembersList: [{ name: 'Jane' }, { name: 'Miguel' }]
        },
        priorities: [
          { action: 'Action', indicator: 'phoneNumber', reason: 'reason' }
        ],
        status: 'In progress'
      }
    ]

    expect(
      reducer.drafts(initialStore, {
        type: action.ADD_SURVEY_FAMILY_MEMBER_DATA,
        id: 2,
        index: 3,
        isSocioEconomicAnswer: false,
        payload: {
          name: 'Miguel'
        }
      })
    ).toEqual(expectedStore)
  })

  it('should handle ADD_SURVEY_FAMILY_MEMBER_DATA when adding socio-economic data to a family member', () => {
    const expectedStore = [
      { draftId: 1, status: 'Synced' },
      {
        draftId: 2,
        familyData: {
          familyMembersList: [
            {
              name: 'Jane',
              socioEconomicAnswers: [{ key: 'income', value: 300 }]
            }
          ]
        },
        priorities: [
          { action: 'Action', indicator: 'phoneNumber', reason: 'reason' }
        ],
        status: 'In progress'
      }
    ]

    expect(
      reducer.drafts(initialStore, {
        type: action.ADD_SURVEY_FAMILY_MEMBER_DATA,
        id: 2,
        index: 0,
        isSocioEconomicAnswer: true,
        payload: {
          income: 300
        }
      })
    ).toEqual(expectedStore)
  })

  it('should handle DELETE_DRAFT', () => {
    const expectedStore = [
      {
        draftId: 1,
        status: 'Synced'
      }
    ]
    expect(
      reducer.drafts(initialStore, {
        type: action.DELETE_DRAFT,
        id: 2
      })
    ).toEqual(expectedStore)
  })
})

describe('language reducer', () => {
  it('should handle SWITCH_LANGUAGE', () => {
    expect(
      reducer.language('en', {
        type: action.SWITCH_LANGUAGE,
        language: 'es'
      })
    ).toEqual('es')
  })
})
