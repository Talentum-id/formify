<template>
  <div class="base-table">
    <div class="header-body">
      <div class="header-row">
        <div
          v-for="(column, index) in columns"
          :key="index"
          class="header-cell"
          :class="{ empty: !rows.length, sort: isSorting }"
          :style="{ textAlign: column.justify || 'left', width: column.width || '100%' }"
          @click="sortByColumn(column.prop)"
        >
          {{ column.label }}
          <Sort
            v-if="column.label && isSorting"
            :direction="
              sortColumn.toLowerCase() === modifyStringSpaces(column.prop) ? sortDirection : 'none'
            "
          />
        </div>
      </div>
    </div>

    <div v-if="rows.length > 0" class="body">
      <div
        v-for="(row, rowIndex) in rows"
        :key="rowIndex"
        class="row"
        :class="{ pointer, 'collapse-custom': isRowCollapsed(rowIndex) }"
        :style="{ justifyItems: row.justify || 'left' }"
        @click="toHandler(row, rowIndex)"
      >
        <div
          v-for="(column, columnIndex) in columns"
          :key="columnIndex"
          class="cell"
          :style="{ width: column.width || '100%', justifyContent: column.justify || 'left' }"
        >
          <div
            v-if="checkIsPropertyExist(row[column.prop], 'adjust') && row[column.prop].adjust"
            class="adjust"
          >
            <Icon name="Right-Arrow1" :size="20" class="arrow-color" />
          </div>
          <div
            v-if="
              checkIsPropertyExist(row[column.prop], 'adjustReturnBtn') &&
              row[column.prop].adjustReturnBtn
            "
            class="adjust-btn"
          >
            <ReturnBtn />
          </div>
          <div class="mobile-header-row">
            <div class="mobile-header-cell">
              {{ column.label }}
            </div>
            <template
              v-if="
                checkIsPropertyExist(row, column.prop) &&
                !checkIsPropertyExist(row[column.prop], 'component') &&
                checkIsPropertyExist(row[column.prop], 'content')
              "
            >
              <div class="table-text">
                {{
                  checkIsPropertyExist(row[column.prop], 'reduceLength') &&
                  row[column.prop].reduceLength
                    ? reduceStringLength(row[column.prop].content, row[column.prop].reduceLength)
                    : row[column.prop].content
                }}
              </div>
            </template>

            <div
              v-else-if="
                checkIsPropertyExist(row[column.prop], 'contents') &&
                checkIsPropertyExist(row[column.prop], 'singleContent')
              "
            >
              <div class="single-component">
                <div class="table-text">
                  {{
                    checkIsPropertyExist(row[column.prop], 'reduceLength') &&
                    row[column.prop].reduceLength
                      ? reduceStringLength(
                          row[column.prop].singleContent,
                          row[column.prop].reduceLength,
                        )
                      : row[column.prop].singleContent
                  }}
                </div>
              </div>
              <div
                class="multi-components"
                :class="{ 'collapse-custom': isRowCollapsed(rowIndex) }"
              >
                <div v-for="item in row[column.prop].contents" :key="item.id" class="table-text">
                  {{
                    checkIsPropertyExist(row[column.prop], 'reduceLength') &&
                    row[column.prop].reduceLength
                      ? reduceStringLength(item, row[column.prop].reduceLength)
                      : item
                  }}
                </div>
              </div>
            </div>

            <div
              v-else-if="
                checkIsPropertyExist(row[column.prop], 'components') &&
                checkIsPropertyExist(row[column.prop], 'singleComponent')
              "
            >
              <div
                class="single-component"
                :class="{ 'collapse-custom': isRowCollapsed(rowIndex) }"
              >
                <component
                  :is="row[column.prop].singleComponent.component"
                  :="row[column.prop].singleComponent.props"
                />
              </div>
              <div
                class="multi-components"
                :class="{ 'collapse-custom': isRowCollapsed(rowIndex) }"
              >
                <template v-for="item in row[column.prop].components" :key="item.id">
                  <div>
                    <component :is="item.component" :="item.props" />
                  </div>
                </template>
              </div>
            </div>

            <template
              v-else-if="
                checkIsPropertyExist(row, column.prop) &&
                !checkIsPropertyExist(row[column.prop], 'component')
              "
            >
              <div class="table-text">
                {{
                  checkIsPropertyExist(row[column.prop], 'reduceLength') &&
                  row[column.prop].reduceLength
                    ? reduceStringLength(row[column.prop], row[column.prop].reduceLength)
                    : row[column.prop]
                }}
              </div>
            </template>

            <template v-else-if="checkIsPropertyExist(row[column.prop], 'component')">
              <component :is="row[column.prop].component" :="row[column.prop].props" />
            </template>

            <template v-else />
          </div>
        </div>
        <div class="arrow-icon" @click="toggleOpenHandler(rowIndex)">
          <Icon v-if="isRowCollapsed(rowIndex)" name="Up" :size="24" />
          <Icon v-else name="Down" :size="24" />
        </div>
      </div>
    </div>
    <EmptyList v-else :title="title" :icon="icon" />
  </div>
</template>

<script>
import arrowRight from '@/assets/icons/arrow-right.svg';
import windowSizeMixin from '@/mixins/windowSizeMixin';
import { reduceStringLength, checkIsPropertyExist, modifyStringSpaces } from '@/util/helpers';
import Sort from '@/components/Table/Sort.vue';
import Icon from '@/components/Icons/Icon.vue';
import ReturnBtn from '@/components/Table/ReturnBtn.vue';
import EmptyList from '@/components/Table/EmptyList.vue';

export default {
  name: 'BaseTable',
  components: { EmptyList, ReturnBtn, Icon, Sort },
  data() {
    return {
      reduceStringLength,
      arrowRight,
      checkIsPropertyExist,
      modifyStringSpaces,
      currentRowId: null,
    };
  },
  mixins: [windowSizeMixin],
  props: {
    columns: {
      type: Array,
      required: true,
    },
    rows: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    pointer: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    loaded: { type: Boolean, default: false },
    sortFunction: {
      type: Function,
      default: null,
    },
    isSorting: { type: Boolean, default: false },
    isCollapse: { type: Boolean, default: false },
    sortDirection: {
      type: String,
      default: '',
    },
    setSortDirection: {
      type: Function,
      default: null,
    },
    sortColumn: {
      type: String,
      default: '',
    },
    setSortColumn: {
      type: Function,
      default: null,
    },
  },
  methods: {
    isRowCollapsed(rowId) {
      return this.currentRowId === rowId;
    },
    toHandler(row) {
      if (this.checkIsPropertyExist(row, 'to')) {
        this.$router.push(row.to);
      }
    },
    toggleOpenHandler(rowId) {
      if (this.currentRowId !== rowId) {
        this.currentRowId = rowId;

        this.$emit('load-responses', rowId);
      } else {
        this.currentRowId = null;
      }
    },
    sortByColumn(column, cantSort) {
      if (!this.isSorting) return;
      if (this.sortColumn === column) {
        if (this.sortDirection === '') {
          this.setSortDirection('desc');
          this.sortFunction(column, 'desc');
        } else if (this.sortDirection === 'desc') {
          this.setSortDirection('asc');
          this.sortFunction(column, 'asc');
        } else {
          this.setSortDirection('');
          this.sortFunction(column, '');
        }
      } else {
        this.setSortColumn(column);
        this.setSortDirection('desc');
        this.sortFunction(column, 'desc');
      }
    },
  },
};
</script>

<style scoped lang="scss">
.arrow-icon {
  position: absolute;
  right: 20px;
  top: 20px;
}

.table-text {
  font-family: $default_font;
  color: $default;
}
.adjust {
  position: absolute;
  top: 17px;
  right: -40px;
}
.arrow-color {
  filter: invert(77%) sepia(28%) saturate(391%) hue-rotate(204deg) brightness(86%) contrast(83%);
}
.adjust-btn {
  position: absolute;
  top: 19px;
  right: 20px;
}
.base-table {
  font-family: $default_font;
  font-size: 14px;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
  grid-gap: 8px;
  width: 100%;
}

.header-body {
  grid-row: 1;
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
  width: 100%;
}

.header-row {
  background: #e9ecf2;
  border: 1px solid #e9ecf2;
  border-radius: 16px;
  display: flex;
  align-items: center;
  overflow: hidden;
  min-height: 64px;
  padding: 0 20px;
  font-family: $default_font;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  text-align: right;
  letter-spacing: 0.014em;
  font-feature-settings:
    'tnum' on,
    'lnum' on,
    'zero' on;
  color: $primary-text;
}

.header-cell {
  font-family: $default_font;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.014em;
  font-feature-settings:
    'tnum' on,
    'lnum' on,
    'zero' on;
  color: $header-text-list;
  &.sort {
    display: flex;
    gap: 3px;
    cursor: pointer;
  }
  &.empty {
    color: $secondary;
  }
}

.body {
  grid-row: 2;
  grid-column: 1 / -1;
  display: grid;
  //   grid-template-rows: repeat(auto-fit, minmax(30px, 1fr));
}

.single-component {
  visibility: inherit;
}

.multi-components {
  display: none;
  flex-direction: column;
  justify-content: flex-end;
  gap: 16px;
  max-width: 0px;
  opacity: 0;
  margin-top: 14px;
  transition: max-width 1s ease-in;

  &.collapse-custom {
    display: flex;
    max-width: fit-content;
    opacity: 1;
  }
}

.row {
  position: relative;
  z-index: 10;
  background: $white;
  border: 1px solid $default-border;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  overflow: inherit;
  padding: 20px;

  font-family: $default_font;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  font-feature-settings:
    'tnum' on,
    'lnum' on,
    'zero' on;
  color: $section-title;
  &.collapse-custom {
    max-height: fit-content;
  }
  &.pointer {
    cursor: pointer;
    &:hover {
      border: 1px solid $default;
    }
  }
}

.cell {
  font-family: $default_font;
  display: flex;
  text-align: left;
  color: black;
  position: relative;
}

.mobile-header-cell {
  display: none;
}

@media (max-width: 768px) {
  .mobile-header-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .mobile-header-cell {
    display: block;
    background: $default-badge-border;
  }
  .cell {
    background: linear-gradient(to right, $default-badge-border 40%, $white 30%);
    padding: 10px;
    width: auto !important;
  }
  .base-table {
    font-size: 12px;
  }

  .header-row {
    display: none;
  }

  .body {
    grid-template-rows: repeat(auto-fit, minmax(100px, 1fr));
  }

  .row {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    padding: 0;
  }
}
</style>
