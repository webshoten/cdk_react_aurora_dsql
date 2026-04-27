export default {
    "scalars": [
        1,
        6,
        7
    ],
    "types": {
        "MedicalStaff": {
            "institutionCode": [
                1
            ],
            "name": [
                1
            ],
            "profession": [
                1
            ],
            "staffCode": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
        "Mutation": {
            "seedMedicalStaffs": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "medicalStaffsByInstitution": [
                0,
                {
                    "institutionCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "seedItems": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SeedItem": {
            "code": [
                1
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpsertMedicalStaffsPayload": {
            "appliedCount": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "Boolean": {}
    }
}