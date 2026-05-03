<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;


class UserCredsFilter{
    protected $allowedParameters = [
        'title_id' => ['eq'],
        'department_id' => ['eq'],
        'branch_id' => ['eq'],
        'status' => ['eq'],
        'role_id' => ['eq']
    ];

    protected $operatorMap = [
        'eq' => '=',
        'lt' => '<',
        'gt' => '>',
        'lte' => '<=',
        'gte' => '>=',
    ];

    public function transform(Request $request, Builder $query){
        foreach ($this->allowedParameters as $param => $operators) {
            $filterValue = $request->query($param);

            if (!isset($filterValue)) {
                continue;
            }

            foreach ($operators as $operator) {
                if (isset($filterValue[$operator])) {
                    if (in_array($param, ['title_id', 'department_id', 'branch_id', 'status',])) {
                        // Filtering user_infos (nested relationship)
                        $query->whereHas('user_infos', function ($subQuery) use ($param, $operator, $filterValue) {
                            $subQuery->where($param, $this->operatorMap[$operator], $filterValue[$operator]);
                        });
                    } 
                    elseif (in_array($param,['role_id'])) {
                        $query->whereHas('roles', function($subQuery) use($param, $operator, $filterValue){
                            $subQuery->where('id', $this->operatorMap[$operator], $filterValue[$operator]);
                        });
                    }
                    else {
                        // Filtering main table (user_credentials)
                        $query->where($param, $this->operatorMap[$operator], $filterValue[$operator]);
                    }
                }
            }

        }
        return $query;
    }
}
