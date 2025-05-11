$(document).ready(function () {
    const homeScreen = $("#home-screen");
    const gameScreen = $("#game-screen");
    const startButton = $("#start-game");
    const backButton = $("#back-btn");

    startButton.click(() => {
        homeScreen.hide();
        gameScreen.show();
        $(".sudoku-game").sudoku({});
    });

    backButton.click(() => {
        location.reload(); // reloads the page
    });
});

(function ($) {
    $.fn.sudoku = function () {
        const $container = $(this);
        const levels = [
            { level: "Easy", numbers: 70 },
            { level: "Medium", numbers: 30 },
            { level: "Hard", numbers: 20 }
        ];
        const state = {
            matrix: [],
            domMatrix: [],
            numRows: 9,
            numCols: 9,
            level: 40,
            selected: null,
            selectedValue: null,
            tracker: { "1": 9, "2": 9, "3": 9, "4": 9, "5": 9, "6": 9, "7": 9, "8": 9, "9": 9 }
        };

        function generateMatrix() {
            const matrix = [];
            for (let i = 0; i < 9; i++) {
                matrix[i] = [];
                for (let j = 0; j < 9; j++) {
                    matrix[i][j] = ((i * 3 + Math.floor(i / 3) + j) % 9) + 1;
                }
            }
            // Shuffle rows and columns within bands
            for (let i = 0; i < 9; i += 3) {
                shuffleRows(matrix, i);
                shuffleCols(matrix, i);
            }
            return matrix;
        }

        function shuffleRows(matrix, start) {
            for (let i = 0; i < 3; i++) {
                const r1 = start + Math.floor(Math.random() * 3);
                const r2 = start + Math.floor(Math.random() * 3);
                [matrix[r1], matrix[r2]] = [matrix[r2], matrix[r1]];
            }
        }

        function shuffleCols(matrix, start) {
            for (let i = 0; i < 3; i++) {
                const c1 = start + Math.floor(Math.random() * 3);
                const c2 = start + Math.floor(Math.random() * 3);
                for (let r = 0; r < 9; r++) {
                    [matrix[r][c1], matrix[r][c2]] = [matrix[r][c2], matrix[r][c1]];
                }
            }
        }

        function createDifficultyPicker() {
            const picker = $("<div class='sdk-picker'></div>");
            levels.forEach(lvl => {
                const btn = $(`<div class='sdk-btn' data-level='${lvl.numbers}'>${lvl.level}</div>`);
                picker.append(btn);
            });
            $container.append(picker);

            picker.find(".sdk-btn").click(function () {
                state.level = parseInt($(this).data("level"));
                picker.remove();
                buildBoard();
            });
        }

        function buildBoard() {
            state.domMatrix = [];
            const table = $("<div class='sdk-table'></div>");

            for (let row = 0; row < state.numRows; row++) {
                state.domMatrix[row] = [];
                const rowDiv = $("<div class='sdk-row'></div>");
                if (row === 2 || row === 5) rowDiv.addClass("sdk-border");

                for (let col = 0; col < state.numCols; col++) {
                    const cell = $(`<div class='sdk-col' data-row='${row}' data-col='${col}'></div>`);
                    if (col === 2 || col === 5) cell.addClass("sdk-border");
                    rowDiv.append(cell);
                    state.domMatrix[row][col] = cell;
                }
                table.append(rowDiv);
            }

            $container.append(table);

            let count = state.level;
            while (count > 0) {
                const r = Math.floor(Math.random() * 9);
                const c = Math.floor(Math.random() * 9);
                const cell = state.domMatrix[r][c];
                if (cell.children().length === 0) {
                    const val = state.matrix[r][c];
                    cell.append(`<div class='sdk-solution'>${val}</div>`);
                    state.tracker[val]--;
                    count--;
                }
            }

            $(".sdk-col").click(function () {
                $(".sdk-col").removeClass("sdk-selected");
                $(".sdk-solution").removeClass("sdk-helper");

                const r = $(this).data("row");
                const c = $(this).data("col");
                if ($(this).children().length === 0) {
                    $(this).addClass("sdk-selected");
                    state.selected = $(this);
                    state.selectedValue = state.matrix[r][c];
                } else {
                    highlightHelper(parseInt($(this).text()));
                }
            });

            createAnswerButtons();
        }

        function createAnswerButtons() {
            const container = $("<div class='sdk-ans-container'></div>");
            for (let num in state.tracker) {
                const btn = $(`<div class='sdk-btn'>${num}</div>`);
                if (state.tracker[num] <= 0) btn.addClass("sdk-no-show");
                container.append(btn);
            }

            container.find(".sdk-btn").click(function () {
                const val = $(this).text();
                if (state.selected && state.selected.children().length === 0) {
                    if (parseInt(val) === state.selectedValue) {
                        state.tracker[val]--;
                        if (state.tracker[val] === 0) {
                            $(this).addClass("sdk-no-show");
                        }
                        state.selected.append(`<div class='sdk-solution'>${val}</div>`);
                        $(".sdk-col").removeClass("sdk-selected");

                        if ($(".sdk-solution").length === $(".sdk-col").length) {
                            $("#back-btn").fadeIn();
                        }
                    }
                }
            });

            $container.append(container);
        }

        function highlightHelper(number) {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    const val = parseInt(state.domMatrix[r][c].text());
                    if (val === number) {
                        state.domMatrix[r][c].find(".sdk-solution").addClass("sdk-helper");
                    }
                }
            }
        }

        // Init
        state.matrix = generateMatrix();
        createDifficultyPicker();
    };
})(jQuery);
