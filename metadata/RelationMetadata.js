"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RelationTypes_1 = require("./types/RelationTypes");
/**
 * Contains all information about some entity's relation.
 */
var RelationMetadata = (function () {
    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------
    function RelationMetadata(args) {
        /**
         * Indicates if this is a parent (can be only many-to-one relation) relation in the tree tables.
         */
        this.isTreeParent = false;
        /**
         * Indicates if this is a children (can be only one-to-many relation) relation in the tree tables.
         */
        this.isTreeChildren = false;
        /**
         * Indicates if relation column value can be nullable or not.
         */
        this.isNullable = true;
        this.target = args.target;
        this.propertyName = args.propertyName;
        this.relationType = args.relationType;
        if (args.inverseSideProperty)
            this._inverseSideProperty = args.inverseSideProperty;
        // if (args.propertyType)
        //     this.propertyType = args.propertyType;
        if (args.isLazy !== undefined)
            this.isLazy = args.isLazy;
        if (args.options.cascadeInsert || args.options.cascadeAll)
            this.isCascadeInsert = true;
        if (args.options.cascadeUpdate || args.options.cascadeAll)
            this.isCascadeUpdate = true;
        if (args.options.cascadeRemove || args.options.cascadeAll)
            this.isCascadeRemove = true;
        if (args.options.nullable !== undefined)
            this.isNullable = args.options.nullable;
        if (args.options.onDelete)
            this.onDelete = args.options.onDelete;
        if (args.options.primary !== undefined)
            this.isPrimary = args.options.primary;
        if (args.isTreeParent)
            this.isTreeParent = true;
        if (args.isTreeChildren)
            this.isTreeChildren = true;
        if (!this._type)
            this._type = args.type;
    }
    Object.defineProperty(RelationMetadata.prototype, "entityTarget", {
        // ---------------------------------------------------------------------
        // Accessors
        // ---------------------------------------------------------------------
        /**
         * Gets relation's entity target.
         * Original target returns target of the class where relation is.
         * This class can be an abstract class, but relation even is from that class,
         * but its more related to a specific entity. That's why we need this field.
         */
        get: function () {
            return this.entityMetadata.target;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "name", {
        /**
         * Gets the name of column in the database.
         * //Cannot be used with many-to-many relations since they don't have a column in the database.
         * //Also only owning sides of the relations have this property.
         */
        get: function () {
            // if (!this.isOwning || this.isManyToMany)
            if (this.isOwning) {
                if (this.joinTable) {
                    return this.joinTable.joinColumnName;
                }
                else if (this.joinColumn) {
                    return this.joinColumn.name;
                }
            }
            else if (this.hasInverseSide) {
                if (this.inverseRelation.joinTable) {
                    return this.inverseRelation.joinTable.inverseJoinColumnName;
                }
                else if (this.inverseRelation.joinColumn && this.inverseRelation.joinColumn.referencedColumn) {
                    return this.inverseRelation.joinColumn.referencedColumn.name;
                }
            }
            throw new Error("Relation name cannot be retrieved.");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "referencedColumnName", {
        /**
         * Gets the name of column to which this relation is referenced.
         * //Cannot be used with many-to-many relations since all referenced are in the junction table.
         * //Also only owning sides of the relations have this property.
         */
        get: function () {
            // if (!this.isOwning)
            //     throw new Error(`Only owning side of the relations can have information about referenced column names.`);
            // for many-to-one and owner one-to-one relations we get referenced column from join column
            /*if (this.joinColumn && this.joinColumn.referencedColumn && this.joinColumn.referencedColumn.name)
                return this.joinColumn.referencedColumn.name;
    
            // for many-to-many relation we give referenced column depend of owner side
            if (this.joinTable) { // need to check if this algorithm works correctly
                if (this.isOwning) {
                    return this.joinTable.referencedColumn.name;
                } else {
                    return this.joinTable.inverseReferencedColumn.name;
                }
            }*/
            if (this.isOwning) {
                if (this.joinTable) {
                    return this.joinTable.referencedColumn.name;
                }
                else if (this.joinColumn) {
                    return this.joinColumn.referencedColumn.name;
                }
            }
            else if (this.hasInverseSide) {
                if (this.inverseRelation.joinTable) {
                    return this.inverseRelation.joinTable.inverseReferencedColumn.name;
                }
                else if (this.inverseRelation.joinColumn) {
                    return this.inverseRelation.joinColumn.name; // todo: didn't get this logic here
                }
            }
            // this should not be possible, but anyway throw error
            throw new Error("Cannot get referenced column name of the relation " + this.entityMetadata.name + "#" + this.name);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "referencedColumn", {
        /**
         * Gets the column to which this relation is referenced.
         */
        get: function () {
            if (this.isOwning) {
                if (this.joinTable) {
                    return this.joinTable.referencedColumn;
                }
                else if (this.joinColumn) {
                    return this.joinColumn.referencedColumn;
                }
            }
            else if (this.hasInverseSide) {
                if (this.inverseRelation.joinTable) {
                    return this.inverseRelation.joinTable.inverseReferencedColumn;
                }
                else if (this.inverseRelation.joinColumn) {
                    return this.inverseRelation.joinColumn.referencedColumn;
                }
            }
            // this should not be possible, but anyway throw error
            throw new Error("Cannot get referenced column of the relation " + this.entityMetadata.name + "#" + this.name);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "type", {
        /**
         * Gets the property's type to which this relation is applied.
         */
        get: function () {
            return this._type instanceof Function ? this._type() : this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "isOwning", {
        /**
         * Indicates if this side is an owner of this relation.
         */
        get: function () {
            return !!(this.isManyToOne ||
                (this.isManyToMany && this.joinTable) ||
                (this.isOneToOne && this.joinColumn));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "isOneToOne", {
        /**
         * Checks if this relation's type is "one-to-one".
         */
        get: function () {
            return this.relationType === RelationTypes_1.RelationTypes.ONE_TO_ONE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "isOneToOneOwner", {
        /**
         * Checks if this relation is owner side of the "one-to-one" relation.
         * Owner side means this side of relation has a join column in the table.
         */
        get: function () {
            return this.isOneToOne && this.isOwning;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "isOneToOneNotOwner", {
        /**
         * Checks if this relation is NOT owner side of the "one-to-one" relation.
         * NOT owner side means this side of relation does not have a join column in the table.
         */
        get: function () {
            return this.isOneToOne && !this.isOwning;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "isOneToMany", {
        /**
         * Checks if this relation's type is "one-to-many".
         */
        get: function () {
            return this.relationType === RelationTypes_1.RelationTypes.ONE_TO_MANY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "isManyToOne", {
        /**
         * Checks if this relation's type is "many-to-one".
         */
        get: function () {
            return this.relationType === RelationTypes_1.RelationTypes.MANY_TO_ONE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "isManyToMany", {
        /**
         * Checks if this relation's type is "many-to-many".
         */
        get: function () {
            return this.relationType === RelationTypes_1.RelationTypes.MANY_TO_MANY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "isManyToManyOwner", {
        /**
         * Checks if this relation's type is "many-to-many", and is owner side of the relationship.
         * Owner side means this side of relation has a join table.
         */
        get: function () {
            return this.isManyToMany && this.isOwning;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "isManyToManyNotOwner", {
        /**
         * Checks if this relation's type is "many-to-many", and is NOT owner side of the relationship.
         * Not owner side means this side of relation does not have a join table.
         */
        get: function () {
            return this.isManyToMany && !this.isOwning;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "hasInverseSide", {
        /**
         * Checks if inverse side is specified by a relation.
         */
        get: function () {
            return this.inverseEntityMetadata && this.inverseEntityMetadata.hasRelationWithPropertyName(this.inverseSideProperty);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "inverseSideProperty", {
        /**
         * Gets the property name of the inverse side of the relation.
         */
        get: function () {
            if (this._inverseSideProperty) {
                return this.computeInverseSide(this._inverseSideProperty);
            }
            else if (this.isTreeParent && this.entityMetadata.hasTreeChildrenRelation) {
                return this.entityMetadata.treeChildrenRelation.propertyName;
            }
            else if (this.isTreeChildren && this.entityMetadata.hasTreeParentRelation) {
                return this.entityMetadata.treeParentRelation.propertyName;
            }
            return "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationMetadata.prototype, "inverseRelation", {
        /**
         * Gets the relation metadata of the inverse side of this relation.
         */
        get: function () {
            var relation = this.inverseEntityMetadata.findRelationWithPropertyName(this.inverseSideProperty);
            if (!relation)
                throw new Error("Inverse side was not found in the relation " + this.entityMetadata.name + "#" + this.inverseSideProperty);
            return relation;
        },
        enumerable: true,
        configurable: true
    });
    // ---------------------------------------------------------------------
    // Public Methods
    // ---------------------------------------------------------------------
    /**
     * Gets given entity's relation's value.
     * Using of this method helps to access value of the lazy loaded relation.
     */
    RelationMetadata.prototype.getEntityValue = function (entity) {
        return this.isLazy ? entity["__" + this.propertyName + "__"] : entity[this.propertyName];
    };
    /**
     * Checks if given entity has a value in a relation.
     */
    RelationMetadata.prototype.hasEntityValue = function (entity) {
        return this.isLazy ? entity["__" + this.propertyName + "__"] : entity[this.propertyName];
    };
    /**
     * todo: lazy relations are not supported here? implement logic?
     *
     * examples:
     *
     * - isOneToOneNotOwner or isOneToMany:
     *  Post has a Category.
     *  Post is owner side.
     *  Category is inverse side.
     *  Post.category is mapped to Category.id
     *
     *  if from Post relation we are passing Category here,
     *  it should return a post.category
     */
    RelationMetadata.prototype.getOwnEntityRelationId = function (ownEntity) {
        if (this.isManyToManyOwner) {
            return ownEntity[this.joinTable.referencedColumn.propertyName];
        }
        else if (this.isManyToManyNotOwner) {
            return ownEntity[this.inverseRelation.joinTable.inverseReferencedColumn.propertyName];
        }
        else if (this.isOneToOneOwner || this.isManyToOne) {
            return ownEntity[this.joinColumn.propertyName];
        }
        else if (this.isOneToOneNotOwner || this.isOneToMany) {
            return ownEntity[this.inverseRelation.joinColumn.referencedColumn.propertyName];
        }
    };
    /**
     *
     * examples:
     *
     * - isOneToOneNotOwner or isOneToMany:
     *  Post has a Category.
     *  Post is owner side.
     *  Category is inverse side.
     *  Post.category is mapped to Category.id
     *
     *  if from Post relation we are passing Category here,
     *  it should return a category.id
     *
     *  @deprecated Looks like this method does not make sence and does same as getOwnEntityRelationId ?
     */
    RelationMetadata.prototype.getInverseEntityRelationId = function (inverseEntity) {
        if (this.isManyToManyOwner) {
            return inverseEntity[this.joinTable.inverseReferencedColumn.propertyName];
        }
        else if (this.isManyToManyNotOwner) {
            return inverseEntity[this.inverseRelation.joinTable.referencedColumn.propertyName];
        }
        else if (this.isOneToOneOwner || this.isManyToOne) {
            return inverseEntity[this.joinColumn.referencedColumn.propertyName];
        }
        else if (this.isOneToOneNotOwner || this.isOneToMany) {
            return inverseEntity[this.inverseRelation.joinColumn.propertyName];
        }
    };
    // ---------------------------------------------------------------------
    // Private Methods
    // ---------------------------------------------------------------------
    /**
     * Inverse side set in the relation can be either string - property name of the column on inverse side,
     * either can be a function that accepts a map of properties with the object and returns one of them.
     * Second approach is used to achieve type-safety.
     */
    RelationMetadata.prototype.computeInverseSide = function (inverseSide) {
        var ownerEntityPropertiesMap = this.inverseEntityMetadata.createPropertiesMap();
        if (typeof inverseSide === "function")
            return inverseSide(ownerEntityPropertiesMap);
        if (typeof inverseSide === "string")
            return inverseSide;
        // throw new Error("Cannot compute inverse side of the relation");
        return "";
    };
    return RelationMetadata;
}());
exports.RelationMetadata = RelationMetadata;

//# sourceMappingURL=RelationMetadata.js.map