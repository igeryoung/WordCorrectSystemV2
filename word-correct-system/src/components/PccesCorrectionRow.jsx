import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { apiDomain } from '../config';
import { CorrectionSelect } from './CorrectionSelect';
import { UnitSelect } from './UnitSelector';
import './style.css';

export default function PccesCorrectionRow({ item, chapters, onUpdateItem }) {
  const [ci, setCi] = useState(item);
  const [selections, setSelections] = useState(item.suffixSelections || []);

  useEffect(() => {
    setCi(item);
  }, [item]);

  // when advanced mode opens, fetch your recommended suggestion
  useEffect(() => {
    // only when toggled on and we have no existing selections
    if (!ci.hasSuggested && selections.length === 0) {
      (async () => {
        try {
          const { data } = await axios.post(`${apiDomain}/correct`, {
            raw_code: ci.originalCode,
            raw_text: ci.originalDescription,
          });
          const { codes, names } = data;
          if (Array.isArray(codes) && Array.isArray(names) && codes.length === names.length) {
            // build selection strings like "code-name"
            const suggested = codes.map((code, idx) => `${code}-${names[idx]}`);

            // set into state
            setSelections(suggested);

            // compute the same metadata you do in handleCascadeChange
            const digits = suggested.map(v => v.split('-')[2] || '');
            const chapterCode = codes[0] || '';
            const restCodes = codes.slice(1);
            const fullCode = chapterCode + restCodes.join('');
            const chapterName = chapters.find(c => c.chapter === chapterCode)?.name || '';
            const fullName = [chapterName, ...names.slice(1)]
              .filter(Boolean)
              .join('，');

            // notify parent
            onUpdateItem(ci.id, {
              hasSuggested: true,
              selectedStage2: chapterCode,
              suffixDigits: digits,
              suffixSelections: suggested,
              correctedCode: fullCode,
              correctedDescription: fullName,
            });
          }
        } catch (err) {
          console.error('Error fetching correction suggestions:', err);
        }
      })();
    }
  }, [ci.showAdvanced, ci.originalCode, ci.originalDescription, chapters, onUpdateItem, selections.length]);

  // handle manual cascades
  const handleCascadeChange = (idx, codeName) => {
    const next = [...selections];
    next[idx] = codeName;
    next.length = idx + 1;
    setSelections(next);

    // compute fullCode & fullName exactly as before...
    const codes = next.map(v => v.split('-')[0]);
    const names = next.map(v => v.split('-')[1]);
    const digits = next.map(v => v.split('-')[2]);
    const chapterCode = codes[0] || '';
    const restCodes = codes.slice(1);
    const fullCode = chapterCode + restCodes.join('');
    const chapterName = chapters.find(c => c.chapter === chapterCode)?.name || '';
    const fullName = [chapterName, ...names.slice(1)]
      .filter(Boolean)
      .join('，');

    onUpdateItem(ci.id, {
      selectedStage2: chapterCode,
      suffixDigits: digits,
      suffixSelections: next,
      correctedCode: fullCode,
      correctedDescription: fullName,
    });
  };

  const handleUnitChange = (codeName) => {
    onUpdateItem(ci.id, {
      unitCode: codeName.split('-')[0],
      unitName: codeName.split('-')[1],
    });
  };

  useEffect(() => {
      // fill tempCode to 9 digits by append 0
      let tmpCode = String(ci.correctedCode).padEnd(9, '0');
      ci.finalCode = tmpCode + (ci.unitCode||"0");
      ci.finalName = ci.correctedDescription + '，' + ci.unitName;
      onUpdateItem(ci.id, {
        finalCode: ci.finalCode,
        finalName: ci.finalName,
      });
  }, [ci.correctedCode, ci.unitCode, ci.correctedDescription, ci.unitName]);

  return (
    <tr data-item-id={ci.id}>
      <td>{ci.originalCode}</td>
      <td>{ci.originalDescription}</td>
      <td>
          <div className="cascade-container">
            {/* Level 0: pick chapter */}
            <CorrectionSelect
              index={0}
              value={selections[0]}
              chapterNames={chapters}
              parentName={selections[0]?.split('-')[1]}
              parentDigit={selections[0]?.split('-')[2]}
              parentGroup={selections[0]?.split('-')[3]}
              onChange={val => handleCascadeChange(0, val)}
            />
            {/* Levels 1…n */}
            {selections.map((_, idx) => (
              <CorrectionSelect
                key={idx + 1}
                index={idx + 1}
                value={selections[idx + 1] || ''}
                chapter={selections[0]?.split('-')[0]}
                parentName={selections[idx].split('-')[1]}
                parentDigit={selections[idx].split('-')[2]}
                parentGroup={selections[idx].split('-')[3]}
                onChange={val => handleCascadeChange(idx + 1, val)}
              />
            ))}

            {ci.selectedStage2 && 
            <UnitSelect 
              chapter={ci.selectedStage2} 
              value={ci.unitCode + '-' + ci.unitName} 
              onChange={val => handleUnitChange(val)} 
            />}
          </div>
        
      </td>
      <td>
        <div><strong>Code:</strong> {ci.finalCode}</div>
        <div><strong>Name:</strong> {ci.finalName}</div>
      </td>
    </tr>
  );
}

PccesCorrectionRow.propTypes = {
  item: PropTypes.object.isRequired,
  chapters: PropTypes.array.isRequired,
  onUpdateItem: PropTypes.func.isRequired,
};
