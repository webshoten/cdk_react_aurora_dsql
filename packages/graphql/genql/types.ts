export default {
    "scalars": [
        1,
        4,
        14
    ],
    "types": {
        "CreateUserPayload": {
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
        "CurrentUser": {
            "groups": [
                1
            ],
            "institutionCode": [
                1
            ],
            "userId": [
                1
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Image": {
            "contentType": [
                1
            ],
            "downloadUrl": [
                1
            ],
            "fileName": [
                1
            ],
            "imageId": [
                1
            ],
            "imagePath": [
                1
            ],
            "sizeBytes": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
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
        "Mutation": {
            "addRandomMedicalStaff": [
                12,
                {
                    "institutionCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "clearMedicalStaffsByInstitution": [
                12,
                {
                    "institutionCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createImageUploadUrl": [
                7,
                {
                    "contentType": [
                        1,
                        "String!"
                    ],
                    "fileName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createUser": [
                0,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "username": [
                        1,
                        "String!"
                    ]
                }
            ],
            "registerImage": [
                9,
                {
                    "contentType": [
                        1,
                        "String!"
                    ],
                    "fileName": [
                        1,
                        "String!"
                    ],
                    "imagePath": [
                        1,
                        "String!"
                    ],
                    "sizeBytes": [
                        4,
                        "Int!"
                    ]
                }
            ],
            "resetUserPassword": [
                10,
                {
                    "username": [
                        1,
                        "String!"
                    ]
                }
            ],
            "seedMedicalStaffs": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "PresignedUploadPayload": {
            "imagePath": [
                1
            ],
            "uploadUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "currentUser": [
                2
            ],
            "images": [
                3
            ],
            "medicalStaffsByInstitution": [
                5,
                {
                    "institutionCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "seedItems": [
                11
            ],
            "users": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "RegisterImagePayload": {
            "appliedCount": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ResetUserPasswordPayload": {
            "temporaryPassword": [
                1
            ],
            "username": [
                1
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "User": {
            "createdAt": [
                1
            ],
            "email": [
                1
            ],
            "uid": [
                1
            ],
            "userType": [
                1
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {}
    }
}