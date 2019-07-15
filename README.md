### Assembler 8 JS (Proof of Concept)

Inspired by the Merlin 8 Assembler for the Apple II

This is an **incomplete** proof of concept demonstrating the use of Javascript and the browser's [contenteditable](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content) attibute.

#### Merlin
- Merlin source code text can be pasted into the Assembler 8 editor
- The code is formatted in Merlin-style columns
- The code can be edited using standard mouse and keboard input
- The edited code can be exported to Merlin-fiendly, space-delimited text

#### Status
- This proof of concept is incomplete and buggy

#### Todo
- add space-triggered tabbing
- add better horizontal and vertical keyboard navigation
- ...

#### Controls
- GetHTML: displays the editor html in the I/O text area
- SetHTML: replaces the editor html with the contents of the I/O text area
- GetText: exports the editor HTML to the I/O text area as Merlin-friendly, space-delimited text
- SetCSS: replaces the active CSS with the contents of the CSS text area
- Reset: restores the editor with example code
- Clear: clears the editor


#### examples
- ring the BELL
```
 ORG $300
 EQU $F8DD
START JSR BELL ;RING THE BELL
END RTS

```

- hires byte patterns from keyboard input
```
 ORG $0800
PATT EQU $FC
GRAPH EQU $C050
TEXT EQU $C051
MIXED EQU $C053
HIRES EQU $C057
PGONE EQU $C054
KEYIN EQU $FD1B ; READ THE KEYBOARD
LSB EQU $FA
MSB EQU $FB
CHAR EQU $C000
CLEAR LDA #$01
 STA PATT
 JSR DRAW
 JMP KEYLOOP
SET LDA #$FF
 STA PATT
 JSR DRAW
KEYLOOP LDA CHAR
 CMP #$80 ; CHECK FOR CHARACTER
 BCC KEYLOOP ; JUMP TO INCREMENT PATT
 JSR KEYIN
 STA PATT
 CMP #$C3 ; C
 BEQ END
 NOP  ; JSR ROTATE
 LDA $C010
 JSR DRAW
 JMP KEYLOOP
ROTATE CLC
 ROL PATT
 BNE ROTRET
 LDA #$01
 STA PATT
ROTRET RTS
END LDA TEXT
 BRK
DRAW LDA #$20
 STA MSB
 LDA #$00
 STA LSB
 LDY #$00 ; TRIGGER SOFT SWITCHES
 LDA GRAPH
 LDA HIRES
 LDA PGONE
LOOP LDA PATT
 STA (LSB),Y
 INC LSB
 BEQ BUMPMSB
 JMP LOOP
BUMPMSB INC MSB
 LDA #$40
 CMP MSB
 BEQ RETURN
 JMP LOOP
RETURN RTS

```