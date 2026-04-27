export default {
    "scalars": [
        1,
        2,
        10
    ],
    "types": {
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
                2
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
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
                9,
                {
                    "institutionCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "clearMedicalStaffsByInstitution": [
                9,
                {
                    "institutionCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createImageUploadUrl": [
                5,
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
            "registerImage": [
                7,
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
                        2,
                        "Int!"
                    ]
                }
            ],
            "seedMedicalStaffs": [
                9
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
            "images": [
                0
            ],
            "medicalStaffsByInstitution": [
                3,
                {
                    "institutionCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "seedItems": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "RegisterImagePayload": {
            "appliedCount": [
                2
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
                2
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {}
    }
}